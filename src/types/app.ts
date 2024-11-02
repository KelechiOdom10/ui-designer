import type { StyleEnum } from "~/server/routes/design";

export type DesignStyle = typeof StyleEnum.static;

export interface DesignPrompt {
  prompt: string;
  style: DesignStyle;
}

export interface GeneratedDesign {
  markup: string; // The actual HTML/Svelte markup
  preview: string; // Sanitized preview HTML
  css: string; // Additional CSS if needed
  metadata: {
    generatedAt: string;
    promptId: string;
    style: DesignStyle;
    modelInfo: string;
    promptTokens: number;
    completionTokens: number;
    processingTime: number;
  };
}

export interface DesignGenerationError {
  code: "INVALID_PROMPT" | "GENERATION_FAILED" | "VALIDATION_FAILED";
  message: string;
  details?: Record<string, any>;
}
