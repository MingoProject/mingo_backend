import Notification from "@/database/notification.model";
import { Types } from "mongoose";
import { connectToDatabase } from "../mongoose";

// Tạo thông báo mới
export async function createNotification(data: {
  userId: string; // ID của người nhận thông báo
  type: "post" | "comment" | "like"; // Loại thông báo
  from: string; // ID của người gửi
  resourceId: string; // ID của tài nguyên liên quan (bài viết, bình luận)
  message?: string; // Nội dung của thông báo (tuỳ chọn)
}) {
  try {
    await connectToDatabase();
    const { userId, type, from, resourceId, message } = data;
    const userObjectId = new Types.ObjectId(userId);
    const fromObjectId = new Types.ObjectId(from);
    const resourceObjectId = new Types.ObjectId(resourceId);

    const notification = await Notification.create({
      user_id: userObjectId,
      type,
      from: fromObjectId,
      resource_id: resourceObjectId,
      isRead: false,
      createdAt: new Date(),
      message: message || "", // Thêm nội dung thông báo nếu có
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification: ", error);
    throw error;
  }
}

// Cập nhật trạng thái thông báo (đã đọc hoặc chưa đọc)
export async function updateNotificationStatus(
  notificationId: string,
  isRead: boolean
) {
  try {
    await connectToDatabase();
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead },
      { new: true }
    );

    if (!notification) {
      throw new Error("Notification not found");
    }

    return { success: true, notification };
  } catch (error) {
    console.error("Error updating notification status: ", error);
    throw error;
  }
}

// Lấy danh sách thông báo cho người dùng
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
