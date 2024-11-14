// lib/actions/post.action.ts
import { connectToDatabase } from "../mongoose";
import Post from "@/database/post.model";
import User from "@/database/user.model";
import { CommentResponseDTO } from "@/dtos/CommentDTO";
import { PostCreateDTO, PostResponseDTO } from "@/dtos/PostDTO";
import { UserResponseDTO } from "@/dtos/UserDTO";
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

export async function likePost(
  postId: string | undefined,
  userId: String | undefined
) {
  try {
    connectToDatabase();
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post) {
      throw new Error(`Post with ID ${postId} does not exist.`);
    }

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    await post.likedIds.addToSet(userId);

    await post.save();

    return { message: `Liked post ${postId}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const getCommentsByPostId = async (
  postId: String
): Promise<CommentResponseDTO[]> => {
  try {
    // Kết nối cơ sở dữ liệu
    await connectToDatabase();

    // Tìm bài viết theo postId và populate comments
    const post = await Post.findById(postId).populate("comments");

    // Nếu bài viết không tồn tại
    if (!post) {
      throw new Error("Post not found");
    }

    // Chuyển đổi các comment sang CommentResponseDTO
    const comments: CommentResponseDTO[] = post.comments.map((comment: any) => {
      // Populate replies nếu có
      const populatedComment: CommentResponseDTO = {
        _id: comment._id.toString(), // Đảm bảo trả về chuỗi thay vì ObjectId
        content: comment.content,
        userId: comment.userId,
        createdTime: comment.createdAt,
        replies: comment.replies, // Giả sử rằng replies là một mảng các comment con đã được populate
        createBy: comment.createBy,
        createAt: comment.createdAt,
      };
      return populatedComment;
    });

    return comments;
  } catch (error: any) {
    throw new Error("Error fetching comments: " + error.message);
  }
};

export const getAuthorByPostId = async (
  postId: string
): Promise<UserResponseDTO> => {
  try {
    // Tìm bài viết theo postId và populate trường author
    const post = await Post.findById(postId).populate("author");

    // Kiểm tra nếu bài viết không tồn tại
    if (!post) {
      throw new Error("Post not found"); // Thông báo lỗi nếu không tìm thấy bài viết
    }

    // Kiểm tra nếu bài viết không có tác giả
    if (!post.author) {
      throw new Error("Author not found"); // Thông báo lỗi nếu không có tác giả
    }

    const author = post.author;

    // Trả về dữ liệu tác giả
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
      bestFriendIds: author.bestFriendIds,
      blockedIds: author.blockedIds,
      createAt: author.createdAt,
      createBy: author.createBy,
    };

    return authorDTO; // Trả về thông tin tác giả
  } catch (error: any) {
    // Ném lỗi với thông điệp chi tiết
    console.error("Error fetching author: ", error);
    throw new Error("Error fetching author: " + error.message);
  }
};
