import { boolean } from "zod";
import { AuditSchema, IAudit } from "./audit.model";
import mongoose, { Schema, models, model, Document } from "mongoose";

export interface INotification extends Document, IAudit {
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
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
    | "tags";
  postId?: mongoose.Schema.Types.ObjectId;
  commentId?: mongoose.Schema.Types.ObjectId;
  messageId?: mongoose.Schema.Types.ObjectId;
  mediaId?: mongoose.Schema.Types.ObjectId;
  isRead: boolean;
}

const NotificationSchema = new Schema<INotification>({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "friend_request",
      "bff_request",
      "friend_accept",
      "bff_accept",
      "comment",
      "comment_media",
      "like",
      "like_comment",
      "like_media",
      "reply_comment",
      "message",
      "tags",
      "report_post",
      "report_user",
      "report_comment",
    ],
    required: true,
  },
  postId: { type: Schema.Types.ObjectId, ref: "Post" },
  commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  messageId: { type: Schema.Types.ObjectId, ref: "Message" },
  mediaId: { type: Schema.Types.ObjectId, ref: "Media" },
  isRead: { type: Boolean, default: false },
});

NotificationSchema.add(AuditSchema);

const Notification =
  models.Notification || model("Notification", NotificationSchema);

export default Notification;
