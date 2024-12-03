import { Schema } from "mongoose";

export interface CreateNotificationDTO {
  senderId: string;
  receiverId: string;
  type: string;
  postId?: string;
  commentId?: string;
  messageId?: string;
  mediaId?: string;
}
