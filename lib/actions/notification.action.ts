import Notification from "@/database/notification.model";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../mongoose";
import { CreateNotificationDTO } from "@/dtos/NotificationDTO";
import { pusherServer } from "../pusher";
import User from "@/database/user.model";

export async function createNotification(params: CreateNotificationDTO) {
  try {
    await connectToDatabase();

    const sender = await User.findById(params.senderId).select(
      "_id avatar firstName lastName"
    );
    if (!sender) {
      throw new Error("Sender not found");
    }

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
      createAt: new Date(),
    });

    await pusherServer.trigger(
      `notifications-${params.receiverId}`,
      "new-notification",
      {
        notification,
        sender: {
          _id: sender._id,
          avatar: sender.avatar,
          firstName: sender.firstName,
          lastName: sender.lastName,
        },
      }
    );
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

export const deleteNotification = async (notificationId: string) => {
  try {
    await connectToDatabase();

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }
    await pusherServer.trigger(
      `notifications-${notification.receiverId}`,
      "notification-deleted",
      {
        notificationId,
      }
    );

    return { message: "Notification deleted successfully" };
  } catch (error) {
    console.error("Error deleting notification: ", error);
    throw error;
  }
};

export const getNotification = async (
  senderId: string,
  receiverId: string,
  type: string
) => {
  try {
    const notification = await Notification.findOne({
      senderId,
      receiverId,
      type,
    }).select("_id");

    return notification;
  } catch (error: any) {
    throw new Error(`Error fetching notifications: ${error.message}`);
  }
};
