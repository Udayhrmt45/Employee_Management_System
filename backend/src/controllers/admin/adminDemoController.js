const adminDemoService = require("../../services/admin/adminDemoService");

exports.getAllDemoRequests = async (req, res, next) => {
  try {
    const status = req.query.status;
    const requests = await adminDemoService.getAllDemoRequests(status);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

exports.getDemoRequestById = async (req, res, next) => {
  try {
    const request = await adminDemoService.getDemoRequestById(req.params.id);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

exports.updateDemoStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await adminDemoService.updateDemoStatus(req.params.id, status);
    res.status(200).json({ success: true, data: request, message: "Status updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateDemoNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const request = await adminDemoService.updateDemoNotes(req.params.id, notes);
    res.status(200).json({ success: true, data: request, message: "Notes updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteDemoRequest = async (req, res, next) => {
  try {
    await adminDemoService.deleteDemoRequest(req.params.id);
    res.status(200).json({ success: true, message: "Demo request deleted successfully" });
  } catch (error) {
    next(error);
  }
};
