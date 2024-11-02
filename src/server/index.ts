import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { designRoutes } from "./routes/design";

const app = new Elysia()
  .use(cors())
  .use(designRoutes)
  .onError(({ code, error }) => {
    return new Response(
      JSON.stringify({
        error: {
          code,
          message: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }
      }),
      {
        status: code === "VALIDATION" ? 400 : 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  })
  .listen(3000);

console.log(`🚀 Server running at http://localhost:${app.server?.port}`);

export type App = typeof app;
