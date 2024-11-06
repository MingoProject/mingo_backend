// lib/actions/post.action.ts
import { connectToDatabase } from "../mongoose";
import Post from "@/database/post.model"; // Đảm bảo đường dẫn chính xác
import { PostCreateDTO, PostResponseDTO } from "@/dtos/PostDTO";
import mongoose, { Schema } from "mongoose";

export async function getAllPosts() {
  try {
    connectToDatabase();
    const result: PostResponseDTO[] = await Post.find();

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createPost(
  params: PostCreateDTO,
  createBy: Schema.Types.ObjectId | undefined
): Promise<PostResponseDTO> {
  try {
    await connectToDatabase();

    const postData = {
      content: params.content,
      media: params.media,
      url: params.url,
      createdAt: new Date(),
      author: createBy ? createBy : new mongoose.Types.ObjectId(),
      location: params.location,
      privacy: {
        type: params.privacy?.type || "public", // Mặc định là public
        allowedUsers: params.privacy?.allowedUsers || [],
      },
      shares: [],
      likes: [],
      comments: [],
      likedIds: [],
      flag: true,
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    };

    const newPost = await Post.create(postData);

    return newPost as PostResponseDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    connectToDatabase();

    // Tìm và xóa người dùng theo ID
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      throw new Error(`Post with ID ${postId} does not exist.`);
    }

    return {
      status: true,
      message: `Post with ID ${postId} has been deleted.`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
