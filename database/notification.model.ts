import { boolean } from "zod";
import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface INotification {
  user_id: Schema.Types.ObjectId;
  type: string;
  from: Schema.Types.ObjectId;
  resource_id: Schema.Types.ObjectId;
  isRead: Boolean;
}

const NotificationSchema = new Schema<INotification>({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  type: { type: String, required: true, enum: ["like", "comment", "post"] },
  from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  resource_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  isRead: { type: Boolean, required: true, default: false },
});

NotificationSchema.add(AuditSchema);

const Notification =
  models.Notification || model("Notification", NotificationSchema);

export default Notification;
