import mongoose, { Schema } from "mongoose";

export interface UpdateCommentDTO {
  content: string;
}
export interface CreateCommentDTO {
  userId: Schema.Types.ObjectId;
  content: string;
  parentId?: Schema.Types.ObjectId;
}

export interface CommentResponseDTO {
  _id: string;
  userId: Schema.Types.ObjectId;
  content: string;
  createdTime: Date;
  parentId?: Schema.Types.ObjectId;
  replies?: CommentResponseDTO[];
  createBy: Schema.Types.ObjectId;
  createAt: Date;
}
