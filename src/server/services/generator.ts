import { nanoid } from "nanoid";
import type { DesignGenerationError, DesignStyle } from "~/types/app";
import { CreativeUIPromptBuilder } from "./prompt-builder";
import parse from "node-html-parser";
import postcss from "postcss";
import { type ModelConfig, DEFAULT_MODEL_CONFIG } from "../config/model-config";
import { logger } from "../utils/logger";

export class DesignGeneratorService {
  private promptBuilder: CreativeUIPromptBuilder;
  private modelConfig: ModelConfig;

  constructor(modelConfig: Partial<ModelConfig> = {}) {
    this.promptBuilder = new CreativeUIPromptBuilder();
    this.modelConfig = {
      ...DEFAULT_MODEL_CONFIG,
      ...modelConfig
    };
    logger.info("Design Generator initialized", this.modelConfig);
  }

  async *generateDesign(input: { prompt: string; style: DesignStyle; iterations?: number }) {
    const startTime = performance.now();

    try {
      logger.startGeneration(input.prompt);

      // Start event
      yield { event: "start", data: { status: "started" } };

      // Build the creative prompt
      yield { event: "progress", data: { stage: "preparing", progress: 0 } };
      const prompt = this.promptBuilder.buildPrompt(input.prompt, input.style);
      const systemPrompt = this.promptBuilder.buildSystemPrompt();

      logger.model("Generating with AI model...");
      yield { event: "progress", data: { stage: "generating", progress: 20 } };

      // Generate design using local model with streaming
      for await (const chunk of this.generateFromLocalModel(prompt, systemPrompt)) {
        yield {
          event: "progress",
          data: {
            stage: "generating",
            progress: 20 + chunk.percentage * 0.6,
            partial: chunk.content
          }
        };
      }

      // Get the final content from the last chunk
      const finalContent = await this.getFinalContent(prompt, systemPrompt);
      logger.debug("Raw model response received");
      logger.parsing("Processing generated code...");
      logger.info("Final content received", finalContent);

      yield { event: "progress", data: { stage: "processing", progress: 80 } };

      // Extract HTML and CSS from response
      const { html, css } = this.parseGeneratedCode(finalContent);
      logger.validation("Checking output...");

      // Validate before processing
      try {
        await this.validateGeneration(html, css);
        logger.success("Validation passed");
      } catch (validationError) {
        logger.warning("Validation warnings", validationError);
      }

      yield { event: "progress", data: { stage: "finalizing", progress: 90 } };

      logger.info("Processing final output...");
      // Post-process the generated code
      const processedHtml = this.processHtml(html);
      const processedCss = this.processCss(css);

      const result = {
        markup: processedHtml,
        css: processedCss,
        preview: processedHtml,
        metadata: {
          generatedAt: new Date().toISOString(),
          promptId: nanoid(),
          style: input.style,
          processingTime: performance.now() - startTime
        }
      };

      yield { event: "complete", data: result };

      logger.success("Generation completed", {
        time: `${Math.round(result.metadata.processingTime)}ms`
      });
    } catch (error) {
      logger.error("Design generation failed", error);
      yield {
        event: "error",
        data: this.handleError(error)
      };
    }
  }

  private async *generateFromLocalModel(prompt: string, systemPrompt: string) {
    try {
      const response = await fetch(this.modelConfig.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.modelConfig.modelName,
          prompt: `${systemPrompt}\n\n${prompt}`,
          temperature: this.modelConfig.temperature,
          top_p: this.modelConfig.topP,
          max_tokens: this.modelConfig.maxTokens,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Model API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let content = "";
      let totalTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const data = JSON.parse(chunk);

        content += data.response;
        totalTokens += data.eval_count || 0;

        yield {
          content,
          percentage: (totalTokens / (this.modelConfig.maxTokens ?? 0)) * 100
        };
      }
    } catch (error) {
      console.error("Local model generation failed:", error);
      throw error;
    }
  }

  // Helper method to get final content for processing
  private async getFinalContent(prompt: string, systemPrompt: string): Promise<string> {
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
    return data.response;
  }

  private parseGeneratedCode(content: string): { html: string; css: string } {
    logger.parsing("Starting code extraction");

    // Extract content between <OUTPUT> tags
    logger.debug("Looking for OUTPUT tags");
    const outputMatch = content.match(/<OUTPUT>([\s\S]*?)<\/OUTPUT>/);
    if (!outputMatch) {
      logger.error("No OUTPUT tags found");
      throw new Error("Invalid output format: Missing OUTPUT tags");
    }

    const output = outputMatch[1].trim();
    logger.debug("Found OUTPUT content", { length: output.length });

    // Extract HTML and CSS sections
    logger.parsing("Extracting HTML and CSS sections");
    const htmlMatch = output.match(/<!-- HTML -->([\s\S]*?)(?=<!-- CSS -->)/);
    const cssMatch = output.match(/<!-- CSS -->([\s\S]*?)$/);

    if (!htmlMatch || !cssMatch) {
      logger.error("Missing required sections", {
        hasHtml: !!htmlMatch,
        hasCss: !!cssMatch
      });
      throw new Error("Invalid output format: Missing HTML or CSS sections");
    }

    const html = htmlMatch[1].trim();
    const css = cssMatch[1].trim();

    logger.success("Code extraction complete", {
      htmlLength: html.length,
      cssLength: css.length
    });

    // Fallback parsing if needed
    if (!html || !css) {
      logger.warning("Primary parsing failed, attempting fallback parsing");
      return this.fallbackParsing(content);
    }

    return { html, css };
  }

  private fallbackParsing(content: string): { html: string; css: string } {
    logger.debug("Starting fallback parsing");

    // Try to find code blocks
    const codeBlocks = content.match(/```(?:html|css)?\n([\s\S]*?)```/g);

    if (codeBlocks && codeBlocks.length >= 2) {
      logger.success("Found code blocks in fallback parsing");
      const html = codeBlocks[0]
        .replace(/```(?:html)?\n/, "")
        .replace(/```$/, "")
        .trim();
      const css = codeBlocks[1]
        .replace(/```(?:css)?\n/, "")
        .replace(/```$/, "")
        .trim();

      logger.info("Fallback parsing successful", {
        htmlLength: html.length,
        cssLength: css.length
      });
      return { html, css };
    }

    // Try to parse complete HTML document
    if (content.includes("<!DOCTYPE html>")) {
      logger.debug("Attempting to parse complete HTML document");
      const htmlDoc = content.trim();
      const cssMatch = htmlDoc.match(/<style>([\s\S]*?)<\/style>/);

      if (cssMatch) {
        logger.success("Successfully extracted CSS from style tags");
        return {
          html: htmlDoc,
          css: cssMatch[1].trim()
        };
      }
    }

    logger.error("All parsing attempts failed");
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
        logger.warning("CSS validation warnings", { warnings: result.warnings() });
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
