export type DesignStyle = "modern" | "minimal" | "playful" | "corporate" | "luxurious";

export interface DesignPrompt {
  prompt: string;
  style: DesignStyle;
}

export interface GeneratedComponent {
  markup: string; // The actual HTML/Svelte markup
  preview: string; // Sanitized preview HTML
  css?: string; // Additional CSS if needed
  metadata?: {
    generatedAt: string;
    promptId: string;
    style: DesignStyle;
  };
}

export interface DesignGenerationError {
  code: "INVALID_PROMPT" | "GENERATION_FAILED" | "VALIDATION_FAILED";
  message: string;
  details?: Record<string, any>;
}
