import { Elysia, t } from "elysia";
import { DesignGeneratorService } from "../services/generator";

export const StyleEnum = t.Enum({
  editorial: "editorial",
  artistic: "artistic",
  brutalist: "brutalist",
  experiential: "experiential",
  retro: "retro",
  maximalist: "maximalist",
  professional: "professional"
});

export const designRoutes = new Elysia().post(
  "/api/design/generate",
  async function* ({ body, set }) {
    set.headers["Content-Type"] = "text/event-stream";
    set.headers["Cache-Control"] = "no-cache";
    set.headers["Connection"] = "keep-alive";

    const generator = new DesignGeneratorService();

    for await (const update of generator.generateDesign(body)) {
      yield update;
    }
  },
  {
    body: t.Object({
      prompt: t.String({ minLength: 1 }),
      style: StyleEnum
    })
  }
);
