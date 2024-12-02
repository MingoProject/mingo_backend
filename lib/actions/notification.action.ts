import Notification from "@/database/notification.model";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../mongoose";
import { CreateNotificationDTO } from "@/dtos/NotificationDTO";

export async function createNotification(params: CreateNotificationDTO) {
  try {
    await connectToDatabase();

    const notification = await Notification.create({
      senderId: params.senderId,
      receiverId: params.receiverId,
      type: params.type,
      postId: params.postId || null,
      commentId: params.commentId || null,
      messageId: params.messageId || null,
      mediaId: params.mediaId || null,
      isRead: false,
      createBy: params.senderId,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification: ", error);
    throw error;
  }
}

export const getNotifications = async (
  userId: mongoose.Schema.Types.ObjectId | undefined
) => {
  return await Notification.find({ receiverId: userId })
    .populate("senderId", "avatar firstName lastName")
    .sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(notificationId, { isRead: true });
};

export async function fetchNotifications(userId: string) {
  try {
    await connectToDatabase();
    const userObjectId = new Types.ObjectId(userId);

    const notifications = await Notification.find({
      user_id: userObjectId,
    })
      .sort({
        createdAt: -1,
      })
      .exec();

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications: ", error);
    throw error;
  }
}
