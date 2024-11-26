import mongoose, { Schema } from "mongoose";

export interface MediaCreateDTO {
  url: string;
  type: string;
  caption?: string;
}
export interface MediaResponseDTO {
  _id: string;
  url: string;
  type: string;
  caption?: string;
  createAt: Date;
  likes: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  shares: Schema.Types.ObjectId[];
  createBy?: Schema.Types.ObjectId;
}
