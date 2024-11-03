import type { StyleEnum } from "~/server/routes/design";

export type DesignStyle = typeof StyleEnum.static;
export interface GeneratedDesign {
  markup: string;
  css: string;
  preview: string;
  metadata: {
    generatedAt: string;
    promptId: string;
    style: DesignStyle;
    processingTime: number;
  };
}

export interface GenerationProgress {
  stage: "preparing" | "generating" | "processing" | "finalizing";
  progress: number;
  partial?: string;
}

export type GenerationEvent =
  | { event: "start"; data: { status: "started" } }
  | { event: "progress"; data: GenerationProgress }
  | { event: "complete"; data: GeneratedDesign }
  | { event: "error"; data: { message: string } };

export interface DesignPrompt {
  prompt: string;
  style: DesignStyle;
}

export interface DesignGenerationError {
  code: "INVALID_PROMPT" | "GENERATION_FAILED" | "VALIDATION_FAILED";
  message: string;
  details?: Record<string, any>;
}
