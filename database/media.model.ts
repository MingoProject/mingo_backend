import mongoose, { Schema, model, Document, models } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

interface IMedia extends Document, IAudit {
  url: string;
  type: string;
  caption?: string;
  createdAt: Date;
  likes: mongoose.Schema.Types.ObjectId[];
  comments: mongoose.Schema.Types.ObjectId[];
  shares: mongoose.Schema.Types.ObjectId[];
  author: mongoose.Schema.Types.ObjectId;
}

const MediaSchema = new Schema<IMedia>({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

MediaSchema.add(AuditSchema);

const Media = models.Media || model<IMedia>("Media", MediaSchema);

export default Media;
