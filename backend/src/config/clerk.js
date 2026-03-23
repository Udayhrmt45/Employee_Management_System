const { clerkMiddleware, getAuth, clerkClient } = require("@clerk/express");

function initializeClerk() {
  return clerkMiddleware();
}

function getAuthenticatedUserId(req) {
  const auth = getAuth(req);

  return {
    auth,
    userId: auth?.userId || null
  };
}

module.exports = {
  clerkClient,
  getAuth,
  getAuthenticatedUserId,
  initializeClerk
};
