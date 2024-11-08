import { Schema } from "mongoose";

export interface MediaCreateDTO {
  url: string;
  type: "image" | "video";
  caption?: string;
  author: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
}

export interface MediaResponseDTO {
  _id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  createdAt: Date;
  author: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  likes: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  shares: Schema.Types.ObjectId[];
  //   createdBy?: Schema.Types.ObjectId; // Từ AuditSchema
  //   updatedBy?: Schema.Types.ObjectId; // Từ AuditSchema
  //   createdAt?: Date;             // Từ AuditSchema
  //   updatedAtAudit?: Date;             // Từ AuditSchema
}
