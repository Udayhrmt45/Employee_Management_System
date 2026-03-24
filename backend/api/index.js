const app = require("../src/app");
const { connectDatabase } = require("../src/config/database");
const { ensureSuperAdmin } = require("../src/services/superAdminService");

let bootstrapPromise;

async function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDatabase();
      await ensureSuperAdmin();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}

module.exports = async (req, res) => {
  await ensureBootstrap();
  return app(req, res);
};
