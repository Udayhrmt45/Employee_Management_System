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

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    return app(req, res);
  }

  try {
    await ensureBootstrap();
  } catch (error) {
    setCorsHeaders(req, res);
    res.statusCode = 500;
    return res.json({
      success: false,
      message: error.message || "Failed to initialize backend services",
      errors: null,
      path: req.url,
      timestamp: new Date().toISOString()
    });
  }

  return app(req, res);
};
