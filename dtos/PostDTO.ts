import { Schema } from "mongoose";

export interface PostCreateDTO {
  content: string;
  media?: string[];
  url?: string;
  location?: string;
  tags?: string[];
  privacy?: {
    type: string;
    allowedUsers?: Schema.Types.ObjectId[];
  };
}

export interface PostResponseDTO {
  _id: string;
  content: string;
  media?: Schema.Types.ObjectId[];
  url?: string;
  createdAt: Date;
  author: Schema.Types.ObjectId;
  shares: Schema.Types.ObjectId[];
  likes: Schema.Types.ObjectId[];
  savedByUsers: Schema.Types.ObjectId[];
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

export interface PostYouLikeDTO {
  _id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
  posts: Array<{
    _id: string;
    content: string;
    posterName: string;
    posterAva: string;
    like_at: Date;
  }>;
}
