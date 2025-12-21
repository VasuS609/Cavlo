import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const startServer = async () => {
  try {
    const server = await app.listen({ port: env.PORT });
    logger.info(`Server running on http://localhost:${env.PORT}`);

    // Graceful shutdown
    const handleSignal = async () => {
      logger.info("Shutting down gracefully...");
      await server.stop();
      process.exit(0);
    };

    process.on("SIGTERM", handleSignal);
    process.on("SIGINT", handleSignal);
  } catch (error) {
    logger.error("Failed to start server:", { error: (error as Error).message });
    process.exit(1);
  }
};

startServer();
