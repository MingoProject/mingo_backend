import mongoose, { Schema } from "mongoose";
import { UserBasicInfo } from "./UserDTO";

export interface UpdateCommentDTO {
  content: string;
  replies?: Schema.Types.ObjectId[];
}

export interface AddReplyCommentDTO {
  replies?: Schema.Types.ObjectId[];
}

export interface CreateCommentDTO {
  content: string;
  replies?: Schema.Types.ObjectId[];
  parentId?: Schema.Types.ObjectId;
  originalCommentId?: Schema.Types.ObjectId;
}

export interface CommentResponseDTO {
  _id: string;
  author: UserBasicInfo;
  content: string;
  replies?: string[];
  likes: string[];
  createAt: Date;
  parentId: UserBasicInfo | null;
  originalCommentId: string;
}
