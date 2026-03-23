const express = require("express");
const companyController = require("../../controllers/admin/companyController");
const asyncHandler = require("../../middleware/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(companyController.getCompanies));
router.get("/:id", asyncHandler(companyController.getCompanyDetails));
router.put("/:id/activate", asyncHandler(companyController.activateCompany));
router.put("/:id/deactivate", asyncHandler(companyController.deactivateCompany));

module.exports = router;
