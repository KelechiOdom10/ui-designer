export interface ModelConfig {
  apiUrl: string;
  modelName: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  apiUrl: process.env.MODEL_API_URL || "http://localhost:11434/api/generate",
  modelName: process.env.MODEL_NAME || "codellama",
  temperature: Number(process.env.MODEL_TEMPERATURE) || 0.7,
  topP: Number(process.env.MODEL_TOP_P) || 0.9,
  maxTokens: Number(process.env.MODEL_MAX_TOKENS) || 4096
};
