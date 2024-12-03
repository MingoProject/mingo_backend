import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IMessageBox extends Document, IAudit {
  senderId: Schema.Types.ObjectId;
  receiverIds: Schema.Types.ObjectId[]; // corrected spelling here
  messageIds: Schema.Types.ObjectId[];
  status: boolean;
}

const MessageBoxSchema = new Schema<IMessageBox>({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverIds: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], // corrected spelling here
  messageIds: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  status: { type: Boolean, required: true, default: true },
});

MessageBoxSchema.add(AuditSchema);

const MessageBox = models.MessageBox || model("MessageBox", MessageBoxSchema);

export default MessageBox;
