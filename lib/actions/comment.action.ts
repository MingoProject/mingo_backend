import Comment, { IComment } from "@/database/comment.model";
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
import Media from "@/database/media.model";

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
      author: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: null,
      originalCommentId: null,
      likes: [],
      createdAt: new Date(),
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

export async function createReplyCommentPost(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  postId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      author: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: params.parentId || null,
      originalCommentId: params.originalCommentId || null,
      likes: [],
      createAt: new Date(),
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

export async function createReplyCommentMedia(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  mediaId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      author: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: params.parentId || null,
      originalCommentId: params.originalCommentId || null,
      likes: [],
      createAt: new Date(),
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    });

    await Media.findByIdAndUpdate(
      mediaId,
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

// export async function deleteCommentReply(
//   commentId: string,
//   originalCommentId: string,
//   postId: string
// ) {
//   try {
//     await connectToDatabase();

//     // Tìm comment cần xóa (commentId)
//     const commentToDelete = await Comment.findById(commentId);
//     if (!commentToDelete) {
//       return {
//         status: false,
//         message: `Comment with ID ${commentId} does not exist.`,
//       };
//     }
//     const repliesToDelete = await Comment.find({ parentId: commentId });
//     const repliesIds = repliesToDelete.map((reply) => reply._id);
//     await Comment.deleteMany({ parentId: commentId });
//     await Comment.findByIdAndDelete(commentId);
//     await Post.findByIdAndUpdate(
//       postId,
//       {
//         $pull: { comments: { $in: [commentId, ...repliesIds] } },
//       },
//       { new: true }
//     );
//     await Comment.findByIdAndUpdate(
//       originalCommentId,
//       {
//         $pull: { replies: { $in: [commentId, ...repliesIds] } },
//       },
//       { new: true }
//     );

//     return {
//       status: true,
//       message: `Comment with ID ${commentId} and its replies have been deleted from post, and removed from original comment replies.`,
//     };
//   } catch (error: any) {
//     console.error(error);
//     return {
//       status: false,
//       message: `An error occurred: ${error.message}`,
//     };
//   }
// }

export async function deleteCommentReply(
  commentId: string,
  originalCommentId: string,
  postId: string
) {
  try {
    await connectToDatabase();

    // Kiểm tra comment tồn tại
    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }

    // Xóa comment chính
    await Comment.findByIdAndDelete(commentId);

    // Xóa comment khỏi post
    await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: commentId },
      },
      { new: true }
    );

    // Xóa comment khỏi replies của comment gốc
    await Comment.findByIdAndUpdate(
      originalCommentId,
      {
        $pull: { replies: commentId },
      },
      { new: true }
    );

    return {
      status: true,
      message: `Comment with ID ${commentId} has been deleted and removed from post & original comment replies.`,
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: false,
      message: `An error occurred: ${error.message}`,
    };
  }
}

export async function deleteCommentReplyMedia(
  commentId: string,
  originalCommentId: string,
  mediaId: string
) {
  try {
    await connectToDatabase();

    // Kiểm tra comment tồn tại
    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }

    // Xóa comment chính
    await Comment.findByIdAndDelete(commentId);

    // Gỡ comment khỏi media
    await Media.findByIdAndUpdate(
      mediaId,
      {
        $pull: { comments: commentId },
      },
      { new: true }
    );

    // Gỡ comment khỏi replies của comment gốc
    await Comment.findByIdAndUpdate(
      originalCommentId,
      {
        $pull: { replies: commentId },
      },
      { new: true }
    );

    return {
      status: true,
      message: `Comment with ID ${commentId} has been deleted and removed from media & original comment replies.`,
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: false,
      message: `An error occurred: ${error.message}`,
    };
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    await connectToDatabase();

    const comment = (await Comment.findById(
      commentId
    ).lean()) as IComment | null;
    if (!comment) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }

    const replies = comment.replies || [];

    const idsToDelete = [commentId, ...replies];
    await Comment.deleteMany({ _id: { $in: idsToDelete } });

    await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { $in: idsToDelete } },
      },
      { new: true }
    );

    return {
      status: true,
      message: `Comment with ID ${commentId} and its replies have been deleted from post.`,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      status: false,
      message: "Error occurred while deleting comment.",
    };
  }
}

export async function deleteCommentMedia(commentId: string, mediaId: string) {
  try {
    await connectToDatabase();

    const comment = (await Comment.findById(
      commentId
    ).lean()) as IComment | null;
    if (!comment) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }

    const replies = comment.replies || [];

    const idsToDelete = [commentId, ...replies];
    await Comment.deleteMany({ _id: { $in: idsToDelete } });

    await Media.findByIdAndUpdate(
      mediaId,
      {
        $pull: { comments: { $in: idsToDelete } },
      },
      { new: true }
    );

    return {
      status: true,
      message: `Comment with ID ${commentId} and its replies have been deleted from post.`,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      status: false,
      message: "Error occurred while deleting comment.",
    };
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
      { content: params.content, replies: params.replies },
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

export async function addReplyToComment(commentId: string, replyId: string) {
  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found.`);
    }

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push(replyId);
    await comment.save();
    return comment;
  } catch (error: any) {
    console.error("Error adding reply:", error);
    return {
      status: false,
      message: error.message,
    };
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

export async function createCommentMedia(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  mediaId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      author: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      likes: [],
      createAt: new Date(),
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
      parentId: null,
      originalCommentId: null,
    });

    const media = await Media.findByIdAndUpdate(
      mediaId,
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

export async function getCommentById(
  commentId: string
): Promise<CommentResponseDTO | null> {
  try {
    await connectToDatabase();

    const comment = await Comment.findById(commentId)
      .populate({
        path: "author",
        select: "_id firstName lastName avatar",
      })
      .populate({
        path: "parentId",
        populate: {
          path: "author",
          select: "_id firstName lastName avatar",
        },
      })
      .populate({
        path: "originalCommentId",
        select: "_id",
      });

    if (!comment) {
      throw new Error("comment not found");
    }

    let parentAuthor = null;
    if (comment.parentId) {
      const parentComment = await Comment.findById(comment.parentId).populate({
        path: "author",
        select: "_id firstName lastName avatar",
      });

      if (parentComment?.author) {
        parentAuthor = {
          _id: parentComment._id.toString(),
          firstName: parentComment.author.firstName || "",
          lastName: parentComment.author.lastName || "",
          avatar: parentComment.author.avatar || "",
        };
      } else {
        // Parent comment đã bị xóa hoặc không có author
        parentAuthor = {
          _id: comment.parentId.toString(),
          firstName: "",
          lastName: "",
          avatar: "",
        };
      }
    }

    const result: CommentResponseDTO = {
      _id: String(comment._id),
      author: {
        _id: comment.author._id.toString(),
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
        avatar: comment.author.avatar,
      },
      content: comment.content,
      replies:
        comment.replies?.map((id: mongoose.Types.ObjectId) => id.toString()) ||
        [],
      likes:
        comment.likes?.map((id: mongoose.Types.ObjectId) => id.toString()) ||
        [],
      createAt: comment.createAt,
      parentId: parentAuthor,
      originalCommentId: comment.originalCommentId?._id?.toString() || null,
    };

    return result;
  } catch (error) {
    console.error("Error fetching comment by ID:", error);
    throw error;
  }
}
