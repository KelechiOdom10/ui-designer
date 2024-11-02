import { Elysia, t } from "elysia";
import { DesignGeneratorService } from "../services/generator";

const StyleEnum = t.Enum({
  modern: "modern",
  minimal: "minimal",
  playful: "playful",
  corporate: "corporate",
  luxurious: "luxurious"
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
