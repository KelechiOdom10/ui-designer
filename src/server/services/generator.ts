import { nanoid } from "nanoid";
import type { DesignGenerationError, DesignStyle, GeneratedDesign } from "~/types/app";
import { CreativeUIPromptBuilder } from "./prompt-builder";
import parse from "node-html-parser";
import postcss from "postcss";
import { type ModelConfig, DEFAULT_MODEL_CONFIG } from "../config/model-config";

export class DesignGeneratorService {
  private promptBuilder: CreativeUIPromptBuilder;
  private modelConfig: ModelConfig;

  constructor(modelConfig: Partial<ModelConfig> = {}) {
    this.promptBuilder = new CreativeUIPromptBuilder();
    this.modelConfig = {
      ...DEFAULT_MODEL_CONFIG,
      ...modelConfig
    };
  }

  async generateDesign(input: {
    prompt: string;
    style: DesignStyle;
    iterations?: number;
  }): Promise<GeneratedDesign> {
    const startTime = performance.now();

    try {
      // Build the creative prompt
      const prompt = this.promptBuilder.buildPrompt(input.prompt, input.style);
      const systemPrompt = this.promptBuilder.buildSystemPrompt();

      // Generate design using local model
      const response = await this.generateFromLocalModel(prompt, systemPrompt);

      // Extract HTML and CSS from response
      const { html, css } = this.parseGeneratedCode(response.content);

      // Validate before processing
      await this.validateGeneration(html, css);

      // Post-process the generated code
      const processedHtml = this.processHtml(html);
      const processedCss = this.processCss(css);

      // Validate after processing
      await this.validateGeneration(processedHtml, processedCss);

      return {
        markup: processedHtml,
        css: processedCss,
        preview: processedHtml, // In reality, you'd want to sanitize this HTML before displaying it
        metadata: {
          generatedAt: new Date().toISOString(),
          promptId: nanoid(),
          style: input.style,
          modelInfo: response.modelInfo,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          processingTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error("Design generation failed:", error);
      throw this.handleError(error);
    }
  }

  private async generateFromLocalModel(prompt: string, systemPrompt: string) {
    try {
      // Using Ollama API format
      const response = await fetch(this.modelConfig.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.modelConfig.modelName,
          prompt: `${systemPrompt}\n\n${prompt}`,
          temperature: this.modelConfig.temperature,
          top_p: this.modelConfig.topP,
          max_tokens: this.modelConfig.maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Model API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.response,
        modelInfo: data.model,
        promptTokens: data.prompt_eval_count,
        completionTokens: data.eval_count
      };
    } catch (error) {
      console.error("Local model generation failed:", error);
      throw error;
    }
  }

  private parseGeneratedCode(content: string): { html: string; css: string } {
    // First try to find marked sections
    const htmlMatch = content.match(/<!-- HTML -->([\s\S]*?)(?=<!-- CSS -->|$)/);
    const cssMatch = content.match(/<!-- CSS -->([\s\S]*?)$/);

    // If we find marked sections, use them
    if (htmlMatch && cssMatch) {
      return {
        html: htmlMatch[1].trim(),
        css: cssMatch[1].trim()
      };
    }

    // Otherwise, try to find HTML and CSS by looking for code blocks
    const codeBlocks = content.match(/```(?:html|css)?\n([\s\S]*?)```/g);

    if (codeBlocks && codeBlocks.length >= 2) {
      const html = codeBlocks[0]
        .replace(/```(?:html)?\n/, "")
        .replace(/```$/, "")
        .trim();
      const css = codeBlocks[1]
        .replace(/```(?:css)?\n/, "")
        .replace(/```$/, "")
        .trim();

      return { html, css };
    }

    // If we find a complete HTML document, try to extract CSS from style tags
    if (content.includes("<!DOCTYPE html>")) {
      const htmlDoc = content.trim();
      const cssMatch = htmlDoc.match(/<style>([\s\S]*?)<\/style>/);

      return {
        html: htmlDoc,
        css: cssMatch ? cssMatch[1].trim() : ""
      };
    }

    throw new Error("Could not parse generated code into HTML and CSS sections");
  }

  private processHtml(html: string): string {
    // Clean up and validate HTML
    return html
      .replace(/\s{2,}/g, " ")
      .replace(/>\s+</g, "><")
      .trim();
  }

  private processCss(css: string): string {
    // Process and optimize CSS
    return css
      .replace(/\s{2,}/g, " ")
      .replace(/{\s+/g, "{ ")
      .replace(/;\s+/g, "; ")
      .replace(/\s+}/g, " }")
      .trim();
  }

  private async validateGeneration(html: string, css: string): Promise<void> {
    // HTML Validation
    try {
      const root = parse(html);

      // Check for basic structure
      if (!root.querySelector("*")) {
        throw new Error("HTML contains no elements");
      }

      // Check for semantic elements
      const semanticElements = ["header", "main", "footer", "section", "article", "nav"];
      const hasSemanticElements = semanticElements.some((el) => root.querySelector(el));

      if (!hasSemanticElements) {
        throw new Error("HTML lacks semantic elements");
      }

      // Check for accessibility
      const images = root.querySelectorAll("img");
      const missingAlt = images.some((img) => !img.getAttribute("alt"));

      if (missingAlt) {
        throw new Error("Images missing alt attributes");
      }
    } catch (error: any) {
      throw new Error(`HTML validation failed: ${error.message}`);
    }

    // CSS Validation
    try {
      const result = await postcss([]).process(css, { from: undefined });

      // Check for basic CSS structure
      if (!css.includes("{")) {
        throw new Error("CSS lacks proper rule structure");
      }

      // Check for responsive design
      if (!css.includes("@media")) {
        throw new Error("CSS lacks media queries for responsive design");
      }

      // Check for interactive states
      const hasInteractiveStates =
        css.includes(":hover") || css.includes(":focus") || css.includes(":active");

      if (!hasInteractiveStates) {
        throw new Error("CSS lacks interactive states");
      }

      // Check for warnings
      if (result.warnings().length > 0) {
        console.warn("CSS Warnings:", result.warnings());
      }
    } catch (error: any) {
      throw new Error(`CSS validation failed: ${error?.message}`);
    }
  }

  private handleError(error: unknown): DesignGenerationError {
    if (error instanceof Error) {
      return {
        code: "GENERATION_FAILED",
        message: error.message,
        details: { originalError: error.toString() }
      };
    }
    return {
      code: "GENERATION_FAILED",
      message: "An unexpected error occurred during design generation"
    };
  }
}
