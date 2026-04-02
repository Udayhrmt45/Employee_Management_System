const demoModel = require("../models/demoModel");

exports.submitDemoRequest = async (demoData) => {
  if (!demoData.name || !demoData.email || !demoData.company_name || !demoData.team_size) {
    const error = new Error("Name, email, company name, and team size are required");
    error.statusCode = 400;
    throw error;
  }
  
  // Here we could also send a notification email asynchronously if configured.

  return await demoModel.createDemoRequest(demoData);
};
