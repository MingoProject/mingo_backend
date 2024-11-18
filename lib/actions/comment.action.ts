import Comment from "@/database/comment.model";
import {
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentResponseDTO,
} from "@/dtos/CommentDTO";
import { connectToDatabase } from "../mongoose";
import mongoose, { Schema } from "mongoose";
import Post from "@/database/post.model";

export async function getAllComments() {
  try {
    connectToDatabase();
    const result: CommentResponseDTO[] = await Comment.find();

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createComment(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  postId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      userId: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || null,
      createdAt: new Date(),
      createdTime: new Date(),
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    });

    await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: newComment._id },
      },
      { new: true }
    );

    return newComment;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    connectToDatabase();

    // Xóa comment khỏi Comment model
    const deleteComment = await Comment.findByIdAndDelete(commentId);
    if (!deleteComment) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }

    // Cập nhật Post để xóa comment khỏi danh sách comments
    await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: commentId }, // Xóa commentId khỏi array comments
      },
      { new: true }
    );

    return {
      status: true,
      message: `Comment with ID ${commentId} has been deleted from post.`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateComment(
  commentId: String,
  params: UpdateCommentDTO
) {
  try {
    connectToDatabase();

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content: params.content },
      { new: true }
    );

    if (!updatedComment) {
      throw new Error(`Comment with ID ${commentId} does not exist.`);
    }

    return {
      status: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
