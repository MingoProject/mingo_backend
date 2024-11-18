import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IChat extends Document, IAudit {
  sender_id: Schema.Types.ObjectId;
  receiver_ids: Schema.Types.ObjectId[]; // corrected spelling here
  message_ids: Schema.Types.ObjectId[];
  status: boolean;
}

const ChatSchema = new Schema<IChat>({
  sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver_ids: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], // corrected spelling here
  message_ids: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  status: { type: Boolean, required: true, default: true },
});

ChatSchema.add(AuditSchema);

const Chat = models.Chat || model("Chat", ChatSchema);

export default Chat;
