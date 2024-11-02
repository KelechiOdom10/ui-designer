import type { Config } from "tailwindcss";

import { join } from "path";
import { skeleton } from "@skeletonlabs/skeleton/plugin";
import * as themes from "@skeletonlabs/skeleton/themes";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    join(require.resolve("@skeletonlabs/skeleton-svelte"), "../**/*.{html,js,svelte,ts}")
  ],
  theme: {
    extend: {}
  },
  plugins: [
    forms,
    typography,
    skeleton({
      themes: [themes.cerberus, themes.nouveau]
    })
  ]
} satisfies Config;
