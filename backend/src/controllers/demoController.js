const demoService = require("../services/demoService");

exports.submitDemoRequest = async (req, res, next) => {
  try {
    const newDemo = await demoService.submitDemoRequest(req.body);
    res.status(201).json({
      success: true,
      data: newDemo,
      message: "Demo request submitted successfully."
    });
  } catch (error) {
    next(error);
  }
};
