import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IMessage extends Document, IAudit {
  status: boolean;
  readed_ids: Schema.Types.ObjectId[];
  contentModel: string;
  contentId: Schema.Types.ObjectId[];
}

const MessageSchema = new Schema<IMessage>({
  status: { type: Boolean, require: true, default: true },
  readed_ids: [{ type: Schema.Types.ObjectId, ref: "User" }],
  contentModel: {
    type: String,
    required: true,
    enum: ["Text", "Image", "Video", "Voice", "Location"],
  },
  contentId: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "contentModel",
    },
  ],
});

MessageSchema.add(AuditSchema);

const Message = models.Message || model("Message", MessageSchema);

export default Message;
