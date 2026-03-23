const express = require("express");

const settingsController = require("../controllers/settingsController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");
const { requireAdminAccess, requireOwnerOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);
router.get("/company", asyncHandler(settingsController.getCompanyProfile));
router.patch("/company", requireAdminAccess, asyncHandler(settingsController.updateCompanyProfile));
router.delete("/company", requireOwnerOnly, asyncHandler(settingsController.deleteCompanyProfile));
router.get("/members", requireAdminAccess, asyncHandler(settingsController.getTeamMembers));
router.post("/members", requireAdminAccess, asyncHandler(settingsController.inviteTeamMember));
router.delete("/members/:memberId", requireAdminAccess, asyncHandler(settingsController.removeTeamMember));

module.exports = router;
