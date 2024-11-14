import mongoose, { Schema, model, Document, models } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

interface IComment extends Document, IAudit {
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
  replies?: mongoose.Schema.Types.ObjectId[];
}

const CommentSchema = new Schema<IComment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

CommentSchema.add(AuditSchema);

const Comment = models.Comment || model<IComment>("Comment", CommentSchema);

export default Comment;
