const settingsModel = require("../../models/settingsModel");

exports.getSettings = async (req, res) => {
  const settings = await settingsModel.getAllSettings();
  res.status(200).json({ success: true, data: settings });
};

exports.updateSettings = async (req, res) => {
  const settingsPayload = req.body;
  const updatedSettings = await settingsModel.updateSettings(settingsPayload);
  res.status(200).json({ success: true, message: "Settings updated successfully", data: updatedSettings });
};
