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
      userId: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: null,
      originalCommentId: null,
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

export async function createReplyCommentPost(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  postId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      userId: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: params.parentId || null,
      originalCommentId: params.originalCommentId || null,
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

export async function createReplyCommentMedia(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  mediaId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      userId: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: params.parentId || null,
      originalCommentId: params.originalCommentId || null,
      likes: [],
      createdAt: new Date(),
      createdTime: new Date(),
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

export async function deleteCommentReply(
  commentId: string,
  originalCommentId: string,
  postId: string
) {
  try {
    await connectToDatabase();

    // Tìm comment cần xóa (commentId)
    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }
    const repliesToDelete = await Comment.find({ parentId: commentId });
    const repliesIds = repliesToDelete.map((reply) => reply._id);
    await Comment.deleteMany({ parentId: commentId });
    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { $in: [commentId, ...repliesIds] } },
      },
      { new: true }
    );
    await Comment.findByIdAndUpdate(
      originalCommentId,
      {
        $pull: { replies: { $in: [commentId, ...repliesIds] } },
      },
      { new: true }
    );

    return {
      status: true,
      message: `Comment with ID ${commentId} and its replies have been deleted from post, and removed from original comment replies.`,
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

    // Tìm comment cần xóa (commentId)
    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }
    const repliesToDelete = await Comment.find({ parentId: commentId });
    const repliesIds = repliesToDelete.map((reply) => reply._id);
    await Comment.deleteMany({ parentId: commentId });
    await Comment.findByIdAndDelete(commentId);
    await Media.findByIdAndUpdate(
      mediaId,
      {
        $pull: { comments: { $in: [commentId, ...repliesIds] } },
      },
      { new: true }
    );
    await Comment.findByIdAndUpdate(
      originalCommentId,
      {
        $pull: { replies: { $in: [commentId, ...repliesIds] } },
      },
      { new: true }
    );

    return {
      status: true,
      message: `Comment with ID ${commentId} and its replies have been deleted from media, and removed from original comment replies.`,
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: false,
      message: `An error occurred: ${error.message}`,
    };
  }
}
// try {
//   // Tìm comment theo ID để lấy danh sách replies
//   const comment = await Comment.findById(commentId).lean();
//   if (!comment) {
//     return { success: false, message: 'Comment không tồn tại.' };
//   }

//   // Xóa comment gốc và các replies của nó
//   const replyIds = comment.replies || []; // Lấy danh sách replies từ trường `replies`
//   await Comment.deleteMany({ _id: { $in: [commentId, ...replyIds] } });

//   return { success: true, message: 'Comment và các replies trực tiếp đã được xóa.' };
// } catch (error) {
//   console.error('Lỗi khi xóa comment và các replies trực tiếp:', error);
//   return { success: false, message: 'Xóa comment thất bại.' };
// }

// export async function deleteComment(commentId: string, postId: string) {
//   try {
//     connectToDatabase();

//     // Xóa comment khỏi Comment model
//     const deleteComment = await Comment.findByIdAndDelete(commentId);
//     if (!deleteComment) {
//       return {
//         status: false,
//         message: `Comment with ID ${commentId} does not exist.`,
//       };
//     }

//     // Cập nhật Post để xóa comment khỏi danh sách comments
//     await Post.findByIdAndUpdate(
//       postId,
//       {
//         $pull: { comments: commentId }, // Xóa commentId khỏi array comments
//       },
//       { new: true }
//     );

//     return {
//       status: true,
//       message: `Comment with ID ${commentId} has been deleted from post.`,
//     };
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

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
      countReport: author.countReport,
      friendIds: author.friendIds,
      followingIds: author.followingIds,
      followerIds: author.followerIds,
      bestFriendIds: author.bestFriendIds,
      blockedIds: author.blockedIds,
      postIds: author.postIds,
      createAt: author.createdAt,
      createBy: author.createBy,
      status: author.status,
      saveIds: author.saveIds,
      likeIds: author.likeIds,
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

export async function createCommentMedia(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  mediaId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      userId: createBy ? createBy : new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      likes: [],
      createdAt: new Date(),
      createdTime: new Date(),
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

// export async function deleteCommentMedia(commentId: string, mediaId: string) {
//   try {
//     connectToDatabase();

//     const deleteComment = await Comment.findByIdAndDelete(commentId);
//     if (!deleteComment) {
//       return {
//         status: false,
//         message: `Comment with ID ${commentId} does not exist.`,
//       };
//     }

//     await Media.findByIdAndUpdate(
//       mediaId,
//       {
//         $pull: { comments: commentId },
//       },
//       { new: true }
//     );

//     return {
//       status: true,
//       message: `Comment with ID ${commentId} has been deleted from media.`,
//     };
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

export const getRepliesByCommentId = async (
  commentId: string
): Promise<CommentResponseDTO[]> => {
  try {
    await connectToDatabase();

    const comment = await Comment.findById(commentId).populate({
      path: "replies",
      model: Comment,
    });

    if (!comment) {
      throw new Error("Post not found");
    }

    const users: CommentResponseDTO[] = comment.replies.map((comment: any) => {
      return {
        _id: comment._id,
        userId: comment.userId,
        content: comment.content,
        replies: comment.replies,
        likes: comment.likes,
        createdAt: comment.createAt,
        createBy: comment.createBy,
      };
    });

    return users;
  } catch (error: any) {
    console.error("Error fetching comment:", error.message);
    throw new Error("Error fetching comment: " + error.message);
  }
};

export async function getCommentById(
  commentId: string
): Promise<CommentResponseDTO | null> {
  try {
    await connectToDatabase();

    const comment = await Comment.findById(commentId)
      .populate("userId", "firstName lastName avatar")
      .populate("replies")
      .populate("likes");
    // .populate("content")
    // .populate("createAt")
    // .populate("createBy");
    if (comment?.parentId) {
      await comment.populate("parentId");
    }

    if (!comment) {
      throw new Error("comment not found");
    }

    return comment;
  } catch (error) {
    console.error("Error fetching comment by ID:", error);
    throw error;
  }
}
