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

export interface NotificationResponseDTO {
  _id: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  receiverId: string;
  type:
    | "friend_request"
    | "bff_request"
    | "friend_accept"
    | "bff_accept"
    | "comment"
    | "comment_media"
    | "like"
    | "like_comment"
    | "like_media"
    | "reply_comment"
    | "message"
    | "tags"
    | "report_post"
    | "report_user"
    | "report_comment"
    | "report_message";
  postId: string | null;
  commentId: string | null;
  messageId: string | null;
  mediaId: string | null;
  isRead: boolean;
  createAt: string;
  createBy: string;
  __v: number;
}
