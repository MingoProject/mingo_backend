import Comment from "@/database/comment.model";
import { CreateCommentDTO, UpdateCommentDTO } from "@/dtos/CommentDTO";
import { connectToDatabase } from "../mongoose";
import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import Post from "@/database/post.model";

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
      parentId: params.parentId || null,
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

export async function deleteComment(commentId: Schema.Types.ObjectId) {
  try {
    connectToDatabase();
    const deleteComment = await Comment.findByIdAndDelete(commentId);
    if (!deleteComment) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }

    return {
      status: true,
      message: `Comment with ID ${commentId} has been deleted.`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateComment(
  commentId: Schema.Types.ObjectId,
  params: UpdateCommentDTO
) {
  try {
    // Kết nối database nếu cần thiết
    connectToDatabase();

    // Tìm và cập nhật nội dung của comment
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
