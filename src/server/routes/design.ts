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
  async ({ body }) => {
    const generator = new DesignGeneratorService();
    return await generator.generateDesign(body);
  },
  {
    body: t.Object({
      prompt: t.String({ minLength: 1 }),
      style: StyleEnum
    }),
    response: t.Object({
      markup: t.String(),
      preview: t.String(),
      metadata: t.Optional(
        t.Object({
          generatedAt: t.String(),
          promptId: t.String(),
          style: StyleEnum
        })
      )
    })
  }
);
