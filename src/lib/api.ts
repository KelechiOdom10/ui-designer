import type { DesignPrompt, GenerationEvent } from "~/types/app";
import { treaty } from "@elysiajs/eden";
import type { App } from "../server";

const api = treaty<App>("http://localhost:3000");

export const generateDesign = async function* (input: DesignPrompt) {
  const { data, error } = await api.api.design.generate.post(input);

  if (error) {
    yield {
      event: "error",
      data: { message: "API request failed" }
    } as GenerationEvent;
    return;
  }

  try {
    for await (const chunk of data) {
      // Eden automatically parses the JSON for us
      yield chunk as GenerationEvent;
    }
  } catch (err) {
    yield {
      event: "error",
      data: {
        message: err instanceof Error ? err.message : "Stream processing failed"
      }
    } as GenerationEvent;
  }
};
