// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
} as const;

// Emojis for different log types
const emojis = {
  info: "ℹ️ ",
  success: "✅ ",
  error: "❌ ",
  warning: "⚠️ ",
  debug: "🔍 ",
  start: "🚀 ",
  model: "🤖 ",
  parse: "📝 ",
  validate: "✨ "
} as const;

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`${colors.blue}${emojis.info}INFO: ${message}${colors.reset}`, data ? data : "");
  },

  success: (message: string, data?: any) => {
    console.log(
      `${colors.green}${emojis.success}SUCCESS: ${message}${colors.reset}`,
      data ? data : ""
    );
  },

  error: (message: string, error?: any) => {
    console.error(
      `${colors.red}${emojis.error}ERROR: ${message}${colors.reset}`,
      error ? error : ""
    );
  },

  warning: (message: string, data?: any) => {
    console.warn(
      `${colors.yellow}${emojis.warning}WARNING: ${message}${colors.reset}`,
      data ? data : ""
    );
  },

  debug: (message: string, data?: any) => {
    console.log(
      `${colors.magenta}${emojis.debug}DEBUG: ${message}${colors.reset}`,
      data ? data : ""
    );
  },

  model: (message: string, data?: any) => {
    console.log(`${colors.cyan}${emojis.model}MODEL: ${message}${colors.reset}`, data ? data : "");
  },

  startGeneration: (prompt: string) => {
    console.log(
      `${colors.bright}${colors.blue}${emojis.start}Starting generation for prompt: "${prompt}"${colors.reset}`
    );
  },

  parsing: (message: string) => {
    console.log(`${colors.cyan}${emojis.parse}PARSING: ${message}${colors.reset}`);
  },

  validation: (message: string) => {
    console.log(`${colors.magenta}${emojis.validate}VALIDATION: ${message}${colors.reset}`);
  }
};
