const express = require("express");

const departmentController = require("../controllers/departmentController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);
router.get("/", asyncHandler(departmentController.listDepartments));
router.post("/", asyncHandler(departmentController.createDepartment));
router.patch("/:id", asyncHandler(departmentController.updateDepartment));
router.delete("/:id", asyncHandler(departmentController.deleteDepartment));

module.exports = router;
