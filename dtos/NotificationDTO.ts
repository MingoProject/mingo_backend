import { Schema } from "mongoose";

export interface NotificationDTO {
  user_id: Schema.Types.ObjectId; // ID của người nhận thông báo
  type: "post" | "comment" | "like"; // Loại thông báo: có thể là bài viết, bình luận, hoặc thích
  from: Schema.Types.ObjectId; // ID của người gửi
  resource_id: Schema.Types.ObjectId; // ID của tài nguyên liên quan (ví dụ: ID bài viết, bình luận)
  isRead: boolean; // Trạng thái đã đọc của thông báo
  createdAt: Date; // Ngày tạo thông báo
  message?: string; // Nội dung của thông báo (tuỳ chọn, nếu bạn muốn thêm mô tả)
}
