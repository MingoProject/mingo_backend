import mongoose, { Schema, model, Document, models } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

interface IComment extends Document, IAudit {
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
  postId: mongoose.Schema.Types.ObjectId;
  parentId?: mongoose.Schema.Types.ObjectId;
  replies?: IComment[];
}

const CommentSchema = new Schema<IComment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

CommentSchema.add(AuditSchema);

const Comment = models.Comment || model<IComment>("Comment", CommentSchema);

export default Comment;
