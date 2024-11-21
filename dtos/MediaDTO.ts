import mongoose, { Schema } from "mongoose";

export interface MediaCreateDTO {
  url: string;
  type: "image" | "video";
  caption?: string;
}
export interface MediaResponseDTO {
  _id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  createdAt: Date;
  likes: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  shares: Schema.Types.ObjectId[];
  createdBy?: Schema.Types.ObjectId;
}
