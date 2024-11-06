// dtos/PostDTO.ts
import { Schema } from "mongoose";

export interface PostCreateDTO {
  content: string; // Nội dung bài viết
  media?: Schema.Types.ObjectId[]; // Mảng các ID media
  url?: string; // Đường dẫn bài viết
  location?: string; // Vị trí
  privacy?: {
    type: string; // public, friends, private
    allowedUsers?: Schema.Types.ObjectId[]; // Mảng các ID người dùng được phép
  };
}

export interface PostResponseDTO {
  _id: string; // ID bài viết
  content: string; // Nội dung bài viết
  media?: Schema.Types.ObjectId[]; // Mảng các ID media
  url?: string; // Đường dẫn bài viết
  createdAt: Date; // Ngày tạo
  author: Schema.Types.ObjectId; // ID tác giả
  shares: Schema.Types.ObjectId[]; // Mảng các ID người dùng đã chia sẻ
  likes: Schema.Types.ObjectId[]; // Mảng các ID người dùng đã thích
  comments: Schema.Types.ObjectId[]; // Mảng các ID bình luận
  location?: string; // Vị trí
  privacy: {
    type: string; // public, friends, private
    allowedUsers?: Schema.Types.ObjectId[]; // Mảng các ID người dùng được phép
  };
  likedIds: Schema.Types.ObjectId[]; // Mảng các ID người dùng đã thích
  flag: boolean; // Cờ trạng thái
}
