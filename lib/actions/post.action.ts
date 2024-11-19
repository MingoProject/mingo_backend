// lib/actions/post.action.ts
import { connectToDatabase } from "../mongoose";
import Post from "@/database/post.model";
import { CommentResponseDTO } from "@/dtos/CommentDTO";
import { PostCreateDTO, PostResponseDTO, PostYouLikeDTO } from "@/dtos/PostDTO";
import { UserResponseDTO } from "@/dtos/UserDTO";
import mongoose, { Schema } from "mongoose";
import Comment from "@/database/comment.model";
import User from "@/database/user.model";
import { console } from "inspector";

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
  postId: String | undefined,
  userId: Schema.Types.ObjectId | undefined
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

    await post.likes.addToSet(userId);

    await post.save();

    return { message: `Liked post ${postId}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function disLikePost(
  postId: string | undefined,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post || !user) {
      throw new Error("Your required content does not exist!");
    }

    await post.likes.pull(userId);

    await post.save();

    return { message: `Disliked post ${postId}` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getCommentsByPostId = async (
  postId: string
): Promise<CommentResponseDTO[]> => {
  try {
    await connectToDatabase();

    const post = await Post.findById(postId).populate({
      path: "comments",
      model: Comment,
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const comments: CommentResponseDTO[] = post.comments.map((comment: any) => {
      return {
        _id: comment._id.toString(),
        content: comment.content,
        userId: comment.userId,
        createdTime: comment.createdAt,
        replies: comment.replies,
        createBy: comment.createBy,
        createAt: comment.createdAt,
      };
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
    await connectToDatabase();
    const post = await Post.findById(postId).populate({
      path: "author",
      model: User,
    });
    if (!post) {
      throw new Error("Post not found");
    }

    if (!post.author) {
      throw new Error("Author not found");
    }

    const author = post.author;

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
    console.error("Error fetching author: ", error);
    throw new Error("Error fetching author: " + error.message);
  }
};

export async function getListLike(userId: string): Promise<PostResponseDTO[]> {
  try {
    await connectToDatabase();

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Tìm tất cả các bài viết mà userId đã like
    const likedPosts = await Post.find({ likes: userId });

    // Kiểm tra nếu không có bài viết nào được tìm thấy
    if (!likedPosts.length) {
      return [];
    }

    // Chuyển đổi danh sách bài viết thành dạng `PostResponseDTO`
    const result: PostResponseDTO[] = likedPosts.map((post) => ({
      _id: post._id.toString(),
      content: post.content,
      media: post.media,
      url: post.url,
      createdAt: post.createdAt,
      author: post.author,
      location: post.location,
      privacy: post.privacy,
      shares: post.shares,
      likes: post.likes,
      comments: post.comments,
      likedIds: post.likedIds,
      flag: post.flag,
      createBy: post.createBy,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching liked posts: ", error);
    throw new Error("Error fetching liked posts: " + error);
  }
}
export async function getLikedPosts(userId: string): Promise<PostYouLikeDTO[]> {
  try {
    console.log("getLikedPosts called with userId:", userId);
    await connectToDatabase();
    console.log("Database connected.");

    if (!userId) {
      throw new Error("User  ID is required");
    }

    const posts = await Post.find({ likes: userId })
      .populate("author", "firstName lastName avatar")
      .select("content createdAt author likes");

    if (!posts.length) {
      return [];
    }
    const result: PostYouLikeDTO[] = posts.map((post) => ({
      _id: post._id.toString(),
      user_id: userId,
      post_id: post._id.toString(),
      created_at: post.createAt ?? new Date(),
      posts: (post.likes || []).map(() => ({
        _id: post._id.toString(),
        content: post.content,
        posterName: `${post.author.firstName} ${post.author.lastName}`,
        posterAva: post.author.avatar
          ? post.author.avatar
          : "https://i.pinimg.com/236x/3d/22/e2/3d22e2269593b9169e7d74fe222dbab0.jpg", // Kiểm tra avatar
        like_at: post.likes.createdAt ?? new Date(),
      })),
    }));

    return result;
  } catch (error) {
    console.error("Error fetching liked posts: ", error);
    throw new Error("Error fetching liked posts: " + error);
  }
}
