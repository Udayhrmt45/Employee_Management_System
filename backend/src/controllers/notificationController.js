const notificationService = require("../services/notificationService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const {
  createNotificationSchema,
  listNotificationSchema,
  notificationIdParamSchema,
  updateNotificationSchema
} = require("../validations/notificationValidation");

exports.createNotification = async (req, res) => {
  const body = validateRequest(createNotificationSchema, req.body);
  const notification = await notificationService.sendNotification(req.user, body);
  res.status(201).json(ApiResponse.success(notification, "Notification sent successfully"));
};

exports.getNotifications = async (req, res) => {
  const query = validateRequest(listNotificationSchema, req.query);
  const notifications = await notificationService.listNotifications(req.user, query);
  res.status(200).json(ApiResponse.success(notifications, "Notifications fetched successfully"));
};

exports.markNotificationRead = async (req, res) => {
  const params = validateRequest(notificationIdParamSchema, req.params);
  const result = await notificationService.markAsRead(req.user, params.id);
  res.status(200).json(ApiResponse.success(result, "Notification marked as read"));
};

exports.updateNotification = async (req, res) => {
  const params = validateRequest(notificationIdParamSchema, req.params);
  const body = validateRequest(updateNotificationSchema, req.body);
  const notification = await notificationService.updateNotification(req.user, params.id, body);
  res.status(200).json(ApiResponse.success(notification, "Notification updated successfully"));
};

exports.deleteNotification = async (req, res) => {
  const params = validateRequest(notificationIdParamSchema, req.params);
  const result = await notificationService.deleteNotification(req.user, params.id);
  res.status(200).json(ApiResponse.success(result, "Notification deleted successfully"));
};
