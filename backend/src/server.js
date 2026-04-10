const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");
const { connectRedis, disconnectRedis } = require("./config/redis");
const { ensureSuperAdmin } = require("./services/superAdminService");
const { ensureLatestSchema } = require("./services/schemaBootstrapService");
const { startSalaryCronJob } = require("./jobs/salaryCronJob");
const logger = require("./utils/logger");

async function bootstrap() {
  try {
    await connectDatabase();
    await ensureLatestSchema();
    await ensureSuperAdmin();

    // Connect Redis — if Redis is unavailable the app still starts,
    // caching will be silently bypassed (getRedis() returns null).
    try {
      await connectRedis();
    } catch (redisError) {
      logger.warn("Redis connection failed — caching will be disabled", {
        message: redisError.message
      });
    }

    const server = app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`);
      
      // Initialize background jobs
      startSalaryCronJob();
    });

    // Graceful shutdown
    async function gracefulShutdown(signal) {
      logger.info(`Received ${signal} — shutting down gracefully`);
      server.close(async () => {
        try {
          await disconnectRedis();
        } catch (error) {
          logger.error("Error during Redis disconnect", { message: error.message });
        }
        process.exit(0);
      });
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to bootstrap application", error);
    process.exit(1);
  }
}

bootstrap();
