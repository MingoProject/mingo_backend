import { Schema, models, model, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface IPost extends Document, IAudit {
  content: string;
  media?: Schema.Types.ObjectId[];
  url?: string;
  createdAt: Date;
  author: Schema.Types.ObjectId;
  shares: Schema.Types.ObjectId[];
  likes: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  location?: string;
  tags?: Schema.Types.ObjectId[];
  privacy: {
    type: string;
    allowedUsers?: Schema.Types.ObjectId[];
  };
  likedIds: Schema.Types.ObjectId[];
  flag: boolean;
}

const PostSchema = new Schema<IPost>({
  content: { type: String, required: true },
  media: [{ type: Schema.Types.ObjectId, ref: "Media" }],
  url: { type: String },
  createdAt: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  shares: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  location: { type: String },
  tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
  privacy: {
    type: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  likedIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  flag: { type: Boolean, required: true, default: true },
});

PostSchema.add(AuditSchema);

const Post = models.Post || model<IPost>("Post", PostSchema);

export default Post;
