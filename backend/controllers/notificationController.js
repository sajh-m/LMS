import { NotificationService } from "../services/notificationService.js";

export async function getMyNotifications(req, res) {
  res.json(await NotificationService.listForUser(req.userId));
}

export async function markNotificationRead(req, res) {
  const notification = await NotificationService.markRead(req.params.id, req.userId);
  if (!notification) return res.status(404).json({ message: "not found" });
  res.json(notification);
}

export async function markAllNotificationsRead(req, res) {
  await NotificationService.markAllRead(req.userId);
  res.json({ message: "ok" });
}
