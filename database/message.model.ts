import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IMessage extends Document, IAudit {
  boxId: Schema.Types.ObjectId;
  status: boolean;
  readedId: Schema.Types.ObjectId[];
  contentId: Schema.Types.ObjectId[];
  text: string[];
  flag: boolean;
  isReact: boolean;
  visibility: Map<string, boolean>;
}

const MessageSchema = new Schema<IMessage>({
  boxId: { type: Schema.Types.ObjectId, ref: "Chat" },
  status: { type: Boolean, require: true, default: true },
  readedId: [{ type: Schema.Types.ObjectId, ref: "User" }],
  contentId: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "File",
    },
  ],
  text: [{ type: String, required: true }],
  flag: { type: Boolean, required: true, default: true },
  isReact: { type: Boolean, required: false, default: false },
  visibility: {
    type: Map,
    of: Boolean,
    default: () => new Map([["defaultUserId", true]]),
  },
});

MessageSchema.add(AuditSchema);

const Message = models.Message || model("Message", MessageSchema);

export default Message;
