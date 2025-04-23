import mongoose, { Schema, model, Document, models } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface IComment extends Document, IAudit {
  author: mongoose.Schema.Types.ObjectId;
  content: string;
  replies?: mongoose.Types.ObjectId[];
  likes?: mongoose.Schema.Types.ObjectId[];
  parentId?: mongoose.Schema.Types.ObjectId;
  originalCommentId?: mongoose.Schema.Types.ObjectId;
}

const CommentSchema = new Schema<IComment>({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  originalCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
});

CommentSchema.add(AuditSchema);

const Comment = models.Comment || model<IComment>("Comment", CommentSchema);

export default Comment;
