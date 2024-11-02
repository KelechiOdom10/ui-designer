import { treaty } from "@elysiajs/eden";
import type { DesignPrompt, DesignStyle } from "~/types/app";
import type { App } from "../server";

export const apiClient = treaty<App>("localhost:3000");

export const generateDesign = async ({ prompt, style }: DesignPrompt) => {
  const response = await apiClient.api.design.generate.post({ prompt, style });

  if (response.error) {
    throw new Error(response.error.value as string);
  }

  return response.data;
};
