import mongoose, { Schema } from "mongoose";

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
  userId: Schema.Types.ObjectId;
  content: string;
  createdTime: Date;
  replies?: Schema.Types.ObjectId[];
  likes: Schema.Types.ObjectId[];
  createBy: Schema.Types.ObjectId;
  createAt: Date;
  parentId: Schema.Types.ObjectId;
  originalCommentId: Schema.Types.ObjectId;
}
