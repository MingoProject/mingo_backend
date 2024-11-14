import mongoose, { Schema } from "mongoose";

export interface UpdateCommentDTO {
  content: string;
}
export interface CreateCommentDTO {
  userId: Schema.Types.ObjectId;
  content: string;
  replies?: Schema.Types.ObjectId;
}

export interface CommentResponseDTO {
  _id: string;
  userId: Schema.Types.ObjectId;
  content: string;
  createdTime: Date;
  replies?: CommentResponseDTO[];
  createBy: Schema.Types.ObjectId;
  createAt: Date;
}
