// lib/actions/post.action.ts
import { connectToDatabase } from "../mongoose";
import Post from "@/database/post.model";
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
        type: params.privacy?.type || "public",
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

export async function updatePost(
  postId: string,
  updateData: Partial<PostCreateDTO>
): Promise<PostResponseDTO> {
  try {
    connectToDatabase();
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error(`Post with ID ${postId} does not exist.`);
    }

    post.content = updateData.content || post.content;
    post.media = updateData.media || post.media;
    post.url = updateData.url || post.url;
    post.location = updateData.location || post.location;
    post.privacy = updateData.privacy || post.privacy;

    const updatedPost = await post.save();

    return updatedPost as PostResponseDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
