import Comment from "@/database/comment.model";
import {
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentResponseDTO,
} from "@/dtos/CommentDTO";
import { connectToDatabase } from "../mongoose";
import mongoose, { Schema } from "mongoose";
import Post from "@/database/post.model";
import { UserResponseDTO } from "@/dtos/UserDTO";
import User from "@/database/user.model";

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
      likes: [],
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

export async function getAuthorByCommentId(
  commentId: string
): Promise<UserResponseDTO> {
  try {
    await connectToDatabase();
    const comment = await Comment.findById(commentId).populate({
      path: "userId",
      model: User,
    });
    if (!comment) {
      throw new Error("comment not found");
    }

    if (!comment.userId) {
      throw new Error("Author not found");
    }

    const author = comment.userId;

    const authorDTO: UserResponseDTO = {
      _id: author._id.toString(),
      firstName: author.firstName,
      lastName: author.lastName,
      nickName: author.nickName,
      phoneNumber: author.phoneNumber,
      email: author.email,
      role: author.roles,
      avatar: author.avatar,
      background: author.background,
      gender: author.gender,
      address: author.address,
      job: author.job,
      hobbies: author.hobbies,
      bio: author.bio,
      point: 0,
      relationShip: author.relationShip,
      birthDay: author.birthDay,
      attendDate: author.attendDate,
      flag: author.flag,
      friendIds: author.friendIds,
      followingIds: author.followingIds,
      bestFriendIds: author.bestFriendIds,
      blockedIds: author.blockedIds,
      postIds: author.postIds,
      createAt: author.createdAt,
      createBy: author.createBy,
    };

    return authorDTO;
  } catch (error: any) {
    console.error("Error fetching author: ", error);
    throw new Error("Error fetching author: " + error.message);
  }
}

export async function likeComment(
  commentId: String | undefined,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);

    if (!comment) {
      throw new Error(`Post with ID ${commentId} does not exist.`);
    }

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    await comment.likes.addToSet(userId);

    await comment.save();

    return { message: `Liked comment ${commentId}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function dislikeComment(
  commentId: string | undefined,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    if (!comment || !user) {
      throw new Error("Your required content does not exist!");
    }

    await comment.likes.pull(userId);

    await comment.save();

    return { message: `Disliked comment ${commentId}` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getLikesByCommentId = async (
  commentId: string
): Promise<UserResponseDTO[]> => {
  try {
    await connectToDatabase();

    const comment = await Comment.findById(commentId).populate({
      path: "likes",
      model: User,
    });

    if (!comment) {
      throw new Error("Post not found");
    }

    const users: UserResponseDTO[] = comment.likes.map((user: any) => {
      return {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        nickName: user.nickName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.roles,
        avatar: user.avatar,
        background: user.background,
        gender: user.gender,
        address: user.address,
        job: user.job,
        hobbies: user.hobbies,
        bio: user.bio,
        point: 0,
        relationShip: user.relationShip,
        birthDay: user.birthDay,
        attendDate: user.attendDate,
        flag: user.flag,
        friendIds: user.friendIds,
        followingIds: user.followingIds,
        bestFriendIds: user.bestFriendIds,
        blockedIds: user.blockedIds,
        postIds: user.postIds,
        createAt: user.createdAt,
        createBy: user.createBy,
      };
    });

    return users;
  } catch (error: any) {
    console.error("Error fetching media:", error.message);
    throw new Error("Error fetching media: " + error.message);
  }
};
