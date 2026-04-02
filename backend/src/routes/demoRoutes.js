const express = require("express");
const router = express.Router();
const demoController = require("../controllers/demoController");

router.post("/", demoController.submitDemoRequest);

module.exports = router;
