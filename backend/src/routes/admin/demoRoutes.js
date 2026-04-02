const express = require("express");
const router = express.Router();
const adminDemoController = require("../../controllers/admin/adminDemoController");

router.get("/", adminDemoController.getAllDemoRequests);
router.get("/:id", adminDemoController.getDemoRequestById);
router.put("/:id/status", adminDemoController.updateDemoStatus);
router.put("/:id/notes", adminDemoController.updateDemoNotes);
router.delete("/:id", adminDemoController.deleteDemoRequest);

module.exports = router;
