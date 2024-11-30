// lib/actions/post.action.ts
import { connectToDatabase } from "../mongoose";
import Post from "@/database/post.model";
import { CommentResponseDTO } from "@/dtos/CommentDTO";
import { PostCreateDTO, PostResponseDTO, PostYouLikeDTO } from "@/dtos/PostDTO";
import { UserResponseDTO } from "@/dtos/UserDTO";
import mongoose, { Schema } from "mongoose";
import Comment from "@/database/comment.model";
import User from "@/database/user.model";
import { MediaResponseDTO } from "@/dtos/MediaDTO";
import Media from "@/database/media.model";
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
      createAt: new Date(),
      createdAt: new Date(),
      author: createBy ? createBy : new mongoose.Types.ObjectId(),
      location: params.location,
      tags: params.tags,
      privacy: {
        type: params.privacy?.type || "public",
        allowedUsers: params.privacy?.allowedUsers || [],
      },
      shares: [],
      likes: [],
      savedByUsers: [],
      comments: [],
      likedIds: [],
      flag: true,
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    };

    const newPost = await Post.create(postData);

    if (createBy) {
      await User.findByIdAndUpdate(
        createBy,
        { $addToSet: { postIds: newPost._id } },
        { new: true }
      );
    }

    return newPost as PostResponseDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    connectToDatabase();

    const post = await Post.findById(postId);
    if (!post) {
      throw new Error(`Post with ID ${postId} does not exist.`);
    }

    const commentIds = post.comments;

    await Comment.deleteMany({ _id: { $in: commentIds } });

    const media = post.media;

    await Media.deleteMany({ _id: { $in: media } });

    await Post.findByIdAndDelete(postId);

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
      followingIds: author.followingIds,
      followerIds: author.followerIds,
      bestFriendIds: author.bestFriendIds,
      blockedIds: author.blockedIds,
      postIds: author.postIds,
      createAt: author.createdAt,
      createBy: author.createBy,
    };

    return authorDTO; // Trả về thông tin tác giả
  } catch (error: any) {
    console.error("Error fetching author: ", error);
    throw new Error("Error fetching author: " + error.message);
  }
};

export const getMediasByPostId = async (
  postId: string
): Promise<MediaResponseDTO[]> => {
  try {
    // Kết nối cơ sở dữ liệu
    await connectToDatabase();

    // Tìm bài viết theo ID và populate trường media
    const post = await Post.findById(postId).populate({
      path: "media",
      model: Media,
    });

    // Nếu bài viết không tồn tại, trả về lỗi
    if (!post) {
      throw new Error("Post not found");
    }

    // Map dữ liệu từ media để tạo danh sách MediaResponseDTO
    const medias: MediaResponseDTO[] = post.media.map((media: any) => {
      return {
        _id: media._id.toString(),
        url: media.url,
        type: media.type,
        caption: media.caption,
        createdAt: media.createdAt,
        author: media.author,
        likes: media.likes || [],
        comments: media.comments || [],
        shares: media.shares || [],
      };
    });

    return medias;
  } catch (error: any) {
    // Xử lý lỗi
    console.error("Error fetching media:", error.message);
    throw new Error("Error fetching media: " + error.message);
  }
};

export async function getLikedPosts(userId: string): Promise<PostYouLikeDTO[]> {
  try {
    console.log("getLikedPosts called with userId:", userId);
    await connectToDatabase();
    console.log("Database connected.");

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Find posts that the user has liked
    const posts = await Post.find({ likes: userId })
      .populate("author", "firstName lastName avatar") // Populate author information
      .select("content createdAt author likes");

    if (!posts.length) {
      return [];
    }

    // Map through posts and create the required response
    const result: any[] = [];

    posts.forEach((post) => {
      const postDate = post.createdAt.toISOString().split("T")[0]; // Get the date part (YYYY-MM-DD)

      // Find if there's already an entry for the same day
      let dayGroup = result.find((item) => item.created_at === postDate);

      if (!dayGroup) {
        // If no group for this day exists, create a new group
        dayGroup = {
          _id: post._id.toString(),
          user_id: userId,
          created_at: postDate, // Grouping by date
          posts: [],
        };
        result.push(dayGroup);
      }

      // Add the post to the day group
      dayGroup.posts.push({
        _id: post._id.toString(),
        content: post.content,
        posterName: `${post.author.firstName} ${post.author.lastName}`,
        posterAva:
          post.author.avatar ||
          "https://i.pinimg.com/236x/3d/22/e2/3d22e2269593b9169e7d74fe222dbab0.jpg",
        like_at: new Date(post.likes[0]?.createdAt), // Assuming the first like timestamp
      });
    });

    return result;
  } catch (error) {
    console.error("Error fetching liked posts: ", error);
    throw new Error("Error fetching liked posts: " + error);
  }
}

export async function savePost(
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

    await Post.updateOne(
      { _id: postId },
      { $addToSet: { savedByUsers: userId } } // Thêm userId vào mảng saves nếu chưa có
    );

    await post.save();

    return { message: `Saved post ${postId}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function unSavePost(
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

    await post.savedByUsers.pull(userId);

    await post.save();

    return { message: `Unsave post ${postId}` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedPosts(userId: string): Promise<PostYouLikeDTO[]> {
  try {
    console.log("getLikedPosts called with userId:", userId);
    await connectToDatabase();
    console.log("Database connected.");

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Find posts that the user has liked
    const posts = await Post.find({ savedByUsers: userId })
      .populate("author", "firstName lastName avatar") // Populate author information
      .select("content createdAt author likes");

    if (!posts.length) {
      return [];
    }

    // Map through posts and create the required response
    const result: any[] = [];

    posts.forEach((post) => {
      const postDate = post.createdAt.toISOString().split("T")[0];
      let dayGroup = result.find((item) => item.created_at === postDate);

      if (!dayGroup) {
        dayGroup = {
          _id: post._id.toString(),
          user_id: userId,
          created_at: postDate,
          posts: [],
        };
        result.push(dayGroup);
      }

      dayGroup.posts.push({
        _id: post._id.toString(),
        content: post.content,
        posterName: `${post.author.firstName} ${post.author.lastName}`,
        posterAva:
          post.author.avatar ||
          "https://i.pinimg.com/236x/3d/22/e2/3d22e2269593b9169e7d74fe222dbab0.jpg",
        like_at: new Date(post.likes[0]?.createdAt),
      });
    });

    return result;
  } catch (error) {
    console.error("Error fetching liked posts: ", error);
    throw new Error("Error fetching liked posts: " + error);
  }
}

export const getLikesByPostId = async (
  postId: string
): Promise<UserResponseDTO[]> => {
  try {
    await connectToDatabase();

    const post = await Post.findById(postId).populate({
      path: "likes",
      model: User,
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const users: UserResponseDTO[] = post.likes.map((user: any) => {
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

export const getTagsByPostId = async (
  postId: string
): Promise<UserResponseDTO[]> => {
  try {
    await connectToDatabase();

    const post = await Post.findById(postId).populate({
      path: "tags",
      model: User,
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const users: UserResponseDTO[] = post.tags.map((user: any) => {
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
        relationShip: user.relationShip,
        birthDay: user.birthDay,
        attendDate: user.attendDate,
        flag: user.flag,
        friendIds: user.friendIds,
        followingIds: user.followingIds,
        followerIds: user.followerIds,
        bestFriendIds: user.bestFriendIds,
        blockedIds: user.blockedIds,
        postIds: user.postIds,
        createAt: user.createdAt,
        createBy: user.createBy,
      };
    });

    return users;
  } catch (error: any) {
    throw new Error("Error fetching comments: " + error.message);
  }
};
