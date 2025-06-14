import { connectToDatabase } from "../mongoose";
import Post from "@/database/post.model";
import {
  MangementPostResponseDTO,
  PostCreateDTO,
  PostResponseDTO,
} from "@/dtos/PostDTO";
import mongoose, { Schema } from "mongoose";
import Comment from "@/database/comment.model";
import User from "@/database/user.model";
import Media from "@/database/media.model";
import { differenceInHours } from "date-fns";

export async function getAllPosts(): Promise<PostResponseDTO[]> {
  try {
    await connectToDatabase();

    const posts = await Post.find()
      .populate({
        path: "author",
        select: "_id firstName lastName avatar",
      })
      .populate({
        path: "media",
        select: "_id url type",
      })
      .populate({
        path: "tags",
        select: "_id firstName lastName avatar",
      })
      .lean();

    const result: PostResponseDTO[] = posts.map((post: any) => ({
      _id: String(post._id),
      content: post.content,
      media: post.media?.map((m: any) => ({
        _id: String(m._id),
        url: m.url,
        type: m.type,
      })),
      createdAt: new Date(post.createdAt),
      author: {
        _id: String(post.author._id),
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        avatar: post.author.avatar,
      },
      shares: post.shares?.map((id: any) => String(id)) || [],
      likes: post.likes?.map((id: any) => String(id)) || [],
      savedByUsers: post.savedByUsers?.map((id: any) => String(id)) || [],
      comments: post.comments?.map((id: any) => String(id)) || [],
      location: post.location,
      tags:
        post.tags?.map((tag: any) => ({
          _id: String(tag._id),
          firstName: tag.firstName,
          lastName: tag.lastName,
          avatar: tag.avatar,
        })) || [],
      privacy: {
        type: post.privacy?.type,
        allowedUsers:
          post.privacy?.allowedUsers?.map((id: any) => String(id)) || [],
      },
      likedIds: post.likedIds?.map((id: any) => String(id)) || [],
      flag: post.flag,
    }));

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getRelevantPosts(
  userId: string,
  page: number = 1,
  limit: number = 5
): Promise<PostResponseDTO[]> {
  try {
    await connectToDatabase();

    const currentUser = await User.findById(userId);
    if (!currentUser) throw new Error("User not found");

    const relatedUserIds = new Set<string>();
    relatedUserIds.add(userId);
    currentUser.friends?.forEach((id: any) => relatedUserIds.add(String(id)));
    currentUser.bestFriends?.forEach((id: any) =>
      relatedUserIds.add(String(id))
    );
    currentUser.following?.forEach((id: any) => relatedUserIds.add(String(id)));

    const skip = (page - 1) * limit;

    const posts = await Post.find({
      author: { $in: Array.from(relatedUserIds) },
    })
      .sort({ createdAt: -1 }) // quan trọng để sắp xếp bài viết
      .skip(skip)
      .limit(limit)
      .populate("author", "_id firstName lastName avatar")
      .populate("media", "_id url type")
      .populate("tags", "_id firstName lastName avatar")
      .lean();

    const result: PostResponseDTO[] = posts.map((post: any) => ({
      _id: String(post._id),
      content: post.content,
      media: post.media?.map((m: any) => ({
        _id: String(m._id),
        url: m.url,
        type: m.type,
      })),
      createdAt: new Date(post.createdAt),
      author: {
        _id: String(post.author._id),
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        avatar: post.author.avatar,
      },
      shares: post.shares?.map((id: any) => String(id)) || [],
      likes: post.likes?.map((id: any) => String(id)) || [],
      savedByUsers: post.savedByUsers?.map((id: any) => String(id)) || [],
      comments: post.comments?.map((id: any) => String(id)) || [],
      location: post.location,
      tags:
        post.tags?.map((tag: any) => ({
          _id: String(tag._id),
          firstName: tag.firstName,
          lastName: tag.lastName,
          avatar: tag.avatar,
        })) || [],
      privacy: {
        type: post.privacy?.type,
        allowedUsers:
          post.privacy?.allowedUsers?.map((id: any) => String(id)) || [],
      },
      likedIds: post.likedIds?.map((id: any) => String(id)) || [],
      flag: post.flag,
    }));

    return result;
  } catch (error) {
    console.error(error);
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

    const populatedPost = await Post.findById(newPost._id)
      .populate({
        path: "author",
        select: "_id firstName lastName avatar", // Chỉ lấy các trường cần thiết
      })
      .populate({
        path: "tags",
        select: "_id firstName lastName avatar", // Ví dụ: lấy id và tên tag
      })
      .populate({
        path: "media",
        select: "_id url type", // Ví dụ: lấy id và url của media
      });

    const result: PostResponseDTO = {
      _id: String(populatedPost._id),
      content: populatedPost.content || "",
      media: (populatedPost.media || []).map((m: any) => ({
        _id: String(m._id),
        url: m.url,
        type: m.type,
      })),
      createdAt: populatedPost.createdAt,
      author: {
        _id: String(populatedPost.author._id),
        firstName: populatedPost.author.firstName,
        lastName: populatedPost.author.lastName,
        avatar: populatedPost.author.avatar,
      },
      shares: [],
      likes: [],
      likedIds: [],
      savedByUsers: [],
      comments: [],
      tags: (populatedPost.tags || []).map((t: any) => ({
        _id: String(t._id),
        firstName: t.firstName,
        lastName: t.lastName,
        avatar: t.avatar,
      })),
      location: populatedPost.location || "",
      flag: populatedPost.flag,
      privacy: {
        type: populatedPost.privacy.type || "public",
        allowedUsers:
          populatedPost.privacy.allowedUsers?.map((id: any) => String(id)) ||
          [],
      },
    };

    return result;
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

    await User.updateMany({ postIds: postId }, { $pull: { postIds: postId } });

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
) {
  try {
    connectToDatabase();
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error(`Post with ID ${postId} does not exist.`);
    }

    post.content = updateData.content || post.content;
    post.media = updateData.media || post.media;
    post.tags = updateData.tags || post.tags;
    post.url = updateData.url || post.url;
    post.location = updateData.location || post.location;
    post.privacy = updateData.privacy || post.privacy;

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id)
      .populate({
        path: "author",
        select: "_id firstName lastName avatar", // Chỉ lấy các trường cần thiết
      })
      .populate({
        path: "tags",
        select: "_id firstName lastName avatar", // Ví dụ: lấy id và tên tag
      })
      .populate({
        path: "media",
        select: "_id url type", // Ví dụ: lấy id và url của media
      });

    return populatedPost;

    // return updatedPost;
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

    user.likeIds.push(postId);

    await user.save();

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

    await user.likeIds.pull(postId);

    await post.save();

    await user.save();

    return { message: `Disliked post ${postId}` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPostById(
  postId: string
): Promise<PostResponseDTO | null> {
  try {
    await connectToDatabase();

    const post = await Post.findById(postId)
      .populate("author", "_id firstName lastName avatar")
      .populate("media")
      // .populate("comments")
      // .populate("likes")
      .populate("shares")
      .populate("tags");

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
}

export async function getManagementPostById(
  postId: string
): Promise<MangementPostResponseDTO | null> {
  try {
    await connectToDatabase();

    // Tìm bài post và populate các trường liên quan
    const post = await Post.findById(postId)
      .populate("author")
      .populate("media")
      .populate({
        path: "comments",
        populate: {
          path: "userId", // Populate userId trong comments
          select: "firstName lastName ", // Lấy các trường cần thiết
        },
      })
      .populate("tags")
      .populate("likes")
      .populate("shares");

    if (!post) {
      throw new Error("Post not found");
    }

    // Xử lý tags
    const tagsUser = post.tags.map((tag: any) => ({
      id: tag._id,
      avatar: tag.avatar,
    }));

    // Xử lý likes
    const likesUser = post.likes.map((like: any) => ({
      id: like._id,
      avatar: like.avatar,
    }));

    // Xử lý shares
    const sharesUser = post.shares.map((share: any) => ({
      id: share._id,
      avatar: share.avatar,
    }));

    // Xử lý media
    const attachments = post.media.map((media: any) => ({
      id: media._id,
      src: media.url,
    }));

    // Xử lý comments
    const comments = post.comments.map((comment: any) => ({
      commentId: comment._id,
      author: {
        id: comment.userId?._id, // Kiểm tra null-safety
        firstName: comment.userId?.firstName,
        lastName: comment.userId?.lastName,
      },
      content: comment.content,
      createAt: comment.createAt,
    }));

    // Tạo đối tượng phản hồi chi tiết
    const detailPost: MangementPostResponseDTO = {
      userId: {
        id: post.author._id,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        avatar: post.author.avatar,
        dob: post.author.birthDay,
        phoneNumber: post.author.phoneNumber,
        email: post.author.email,
        gender: post.author.gender,
      },
      postId: post._id,
      content: post.content,
      createAt: post.createAt,
      location: post.location,
      tag: tagsUser,
      privacy: post.privacy.type,
      attachment: attachments,
      like: likesUser,
      share: sharesUser,
      comment: comments,
    };

    return detailPost;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
}

export const countPosts = async () => {
  try {
    const count = await Post.countDocuments();
    return count;
  } catch (error: any) {
    throw new Error("Error counting posts: " + error.message);
  }
};

export const countPostsByCreatedDate = async () => {
  try {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate).setDate(
      new Date(currentDate).getDate() + 1
    );

    const count = await Post.countDocuments({
      createAt: { $gte: currentDate, $lt: nextDay },
    });

    return count;
  } catch (error: any) {
    throw new Error("Error counting posts by createdDate: " + error.message);
  }
};

export const getTrendingPosts = async (): Promise<PostResponseDTO[]> => {
  try {
    await connectToDatabase();

    const posts = await Post.find({ flag: true })
      .populate({
        path: "author",
        select: "_id firstName lastName avatar",
      })
      .populate({
        path: "media",
        select: "_id url type",
      })
      .populate({
        path: "tags",
        select: "_id firstName lastName avatar",
      })
      .lean();

    const scoredPosts = posts.map((post: any) => {
      const now = new Date();
      const hoursSinceCreated = Math.max(
        differenceInHours(now, post.createdAt),
        1
      );

      const score =
        Math.log10((post.likes?.length || 0) + 1) +
        Math.log10((post.comments?.length || 0) + 1) * 1.2 +
        Math.log10((post.shares?.length || 0) + 1) * 1.5 -
        hoursSinceCreated * 0.1;

      return { ...post, trendScore: score };
    });

    scoredPosts.sort((a, b) => b.trendScore - a.trendScore);

    const topPosts = scoredPosts.slice(0, 10);

    const result: PostResponseDTO[] = topPosts.map((post: any) => ({
      _id: String(post._id),
      content: post.content,
      media: post.media?.map((m: any) => ({
        _id: String(m._id),
        url: m.url,
        type: m.type,
      })),
      createdAt: new Date(post.createdAt),
      author: {
        _id: String(post.author._id),
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        avatar: post.author.avatar,
      },
      shares: post.shares?.map((id: any) => String(id)) || [],
      likes: post.likes?.map((id: any) => String(id)) || [],
      savedByUsers: post.savedByUsers?.map((id: any) => String(id)) || [],
      comments: post.comments?.map((id: any) => String(id)) || [],
      location: post.location,
      tags:
        post.tags?.map((tag: any) => ({
          _id: String(tag._id),
          firstName: tag.firstName,
          lastName: tag.lastName,
          avatar: tag.avatar,
        })) || [],
      privacy: {
        type: post.privacy?.type,
        allowedUsers:
          post.privacy?.allowedUsers?.map((id: any) => String(id)) || [],
      },
      likedIds: post.likedIds?.map((id: any) => String(id)) || [],
      flag: post.flag,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    throw new Error("Failed to fetch trending posts");
  }
};
