const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");
const { connectRedis } = require("./config/redis");
const { ensureSuperAdmin } = require("./services/superAdminService");
const logger = require("./utils/logger");

async function bootstrap() {
  try {
    await connectDatabase();
    await ensureSuperAdmin();
    // await connectRedis(); // Disabled for local dev without redis container

    app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error("Failed to bootstrap application", error);
    process.exit(1);
  }
}

bootstrap();
