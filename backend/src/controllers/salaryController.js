const salaryService = require("../services/payrollService");
const { generateSalarySlipPDF } = require("../utils/pdfGenerator");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");
const validateRequest = require("../utils/requestValidator");
const { getDatabase } = require("../config/database");
const {
  setSalaryStructureSchema,
  generateSlipSchema,
  slipIdParamSchema,
  employeeIdParamSchema,
  slipsQuerySchema
} = require("../validations/salaryValidation");

// ─── Structure ────────────────────────────────────────────────────────────────

exports.setStructure = async (req, res) => {
  const body = validateRequest(setSalaryStructureSchema, req.body);
  const structure = await salaryService.setSalaryStructure(
    req.companyId,
    req.user,
    body
  );
  res.status(200).json(ApiResponse.success(structure, "Salary structure saved successfully"));
};

exports.getStructure = async (req, res) => {
  const params = validateRequest(employeeIdParamSchema, req.params);
  const structure = await salaryService.getSalaryStructure(
    req.companyId,
    req.user,
    params.employeeId
  );
  if (!structure) {
    return res
      .status(404)
      .json(ApiResponse.success(null, "No salary structure found for this employee"));
  }
  res.status(200).json(ApiResponse.success(structure, "Salary structure fetched successfully"));
};

// ─── Slips ────────────────────────────────────────────────────────────────────

exports.generateSlip = async (req, res) => {
  const body = validateRequest(generateSlipSchema, req.body);
  const slip = await salaryService.generateSalarySlip(req.companyId, req.user, body);
  res.status(201).json(ApiResponse.success(slip, "Salary slip generated successfully"));
};

exports.getSlips = async (req, res) => {
  const query = validateRequest(slipsQuerySchema, req.query);
  const role = String(req.user.role || "").toUpperCase();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const slips = isAdmin
    ? await salaryService.getCompanySlips(req.companyId, req.user, query)
    : await salaryService.getMySlips(req.companyId, req.user, query);

  res.status(200).json(ApiResponse.success(slips, "Salary slips fetched successfully"));
};

exports.getSlipById = async (req, res) => {
  const params = validateRequest(slipIdParamSchema, req.params);
  const slip = await salaryService.getSlipById(req.companyId, req.user, params.id);
  res.status(200).json(ApiResponse.success(slip, "Salary slip fetched successfully"));
};

exports.downloadSlipPdf = async (req, res) => {
  const params = validateRequest(slipIdParamSchema, req.params);
  const slip = await salaryService.getSlipById(req.companyId, req.user, params.id);

  // Pull company name for the PDF header
  const db = getDatabase();
  const companyResult = await db.query(
    `SELECT name FROM companies WHERE id = $1 LIMIT 1`,
    [req.companyId]
  );
  const companyName = companyResult.rows[0]?.name || "Your Company";

  const pdfBuffer = await generateSalarySlipPDF(slip, companyName);

  const filename = `salary-slip-${slip.employeeName?.replace(/\s+/g, "-")}-${slip.month}-${slip.year}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  res.send(pdfBuffer);
};
