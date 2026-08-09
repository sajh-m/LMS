import { Notification } from "../models/index.js";

export const NotificationService = {
  create: (userId, message) => Notification.create({ userId, message }),

  listForUser: (userId) =>
    Notification.findAll({ where: { userId }, order: [["id", "DESC"]] }),

  markRead: async (id, userId) => {
    const notification = await Notification.findByPk(id);
    if (!notification || notification.userId !== userId) return null;
    notification.isRead = true;
    await notification.save();
    return notification;
  },

  markAllRead: (userId) =>
    Notification.update({ isRead: true }, { where: { userId, isRead: false } }),
};
