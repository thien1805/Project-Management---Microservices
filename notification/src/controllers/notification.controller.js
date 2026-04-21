const notificationService = require('../services/notification.service');

const createNotification = async (req, res) => {
  try {
    const record = await notificationService.createNotification(req.body);
    return res.status(201).json({
      success: true,
      message: 'Notification received',
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const listNotifications = async (req, res) => {
  try {
    const records = await notificationService.listNotifications(req.query);

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: records,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNotification,
  listNotifications,
};
