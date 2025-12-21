import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { cors } from "@elysiajs/cors";
import { env } from "./config/env";
import { websocketPlugin } from "./modules/ws/websocket";
import { monitoringPlugin } from "./modules/monitoring";
import { logger } from "./utils/logger";

const app = new Elysia({
  name: "main-app",
})
  .use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  )
  .use(
    rateLimit({
      max: 100,
      duration: 60_000,
    }),
  )
  .get("/health", () => {
    logger.debug("Health check endpoint called");
    return { success: true, data: "OK", error: null };
  })
  .get("/api/health", () => {
    logger.debug("API health check endpoint called");
    return {
      success: true,
      data: { status: "healthy", timestamp: Date.now() },
      error: null,
    };
  })
  .use(websocketPlugin)
  .use(monitoringPlugin)
  .onError(({ code, error, set }) => {
    logger.error("Application error", {
      code,
      message: (error as Error).message,
    });

    switch (code) {
      case "NOT_FOUND":
        set.status = 404;
        return { success: false, data: null, error: "Route not found" };
      case "VALIDATION":
        set.status = 400;
        return { success: false, data: null, error: (error as Error).message };
      case "PARSE":
        set.status = 400;
        return { success: false, data: null, error: "Invalid request format" };
      default:
        set.status = 500;
        return { success: false, data: null, error: "Internal server error" };
    }
  });

export default app;
