import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Notification } from "../models/Notification.model";

export const listMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ recipient: req.user!.userId })
    .sort({ createdAt: -1 })
    .limit(100);

  const unreadCount = await Notification.countDocuments({ recipient: req.user!.userId, isRead: false });

  res.status(200).json(new ApiResponse("Notifications fetched", { notifications, unreadCount }));
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw ApiError.notFound("Notification not found");
  if (notification.recipient.toString() !== req.user!.userId) throw ApiError.forbidden();

  notification.isRead = true;
  await notification.save();

  res.status(200).json(new ApiResponse("Notification marked as read", notification));
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ recipient: req.user!.userId, isRead: false }, { isRead: true });
  res.status(200).json(new ApiResponse("All notifications marked as read"));
});
