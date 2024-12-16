import { connectToDatabase } from "../mongoose";
import Media from "@/database/media.model";
import User from "@/database/user.model";
import Comment from "@/database/comment.model";
import { CommentResponseDTO } from "@/dtos/CommentDTO";
import { MediaCreateDTO, MediaResponseDTO } from "@/dtos/MediaDTO";
import { UserResponseDTO } from "@/dtos/UserDTO";
import mongoose, { Schema } from "mongoose";

export async function getAllComments(): Promise<MediaResponseDTO[]> {
  try {
    await connectToDatabase();
    return await Media.find();
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

export async function createMedia(
  params: MediaCreateDTO,
  createBy: mongoose.Schema.Types.ObjectId | undefined
): Promise<MediaResponseDTO> {
  try {
    await connectToDatabase();
    console.log(createBy);

    const mediaData = {
      url: params.url,
      type: params.type,
      caption: params.caption || "",
      createAt: new Date(),
      createBy: createBy || new mongoose.Types.ObjectId(),
      shares: [],
      likes: [],
      comments: [],
    };

    const newMedia = await Media.create(mediaData);

    return newMedia as MediaResponseDTO;
  } catch (error) {
    console.error("Error creating media:", error);
    throw error;
  }
}

export async function likeMedia(
  mediaId: String | undefined,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();
    const media = await Media.findById(mediaId);
    const user = await User.findById(userId);

    if (!media) {
      throw new Error(`Media with ID ${mediaId} does not exist.`);
    }

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    await media.likes.addToSet(userId);

    await media.save();

    return { message: `Liked media ${mediaId}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function disLikeMedia(
  mediaId: string | undefined,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();
    const media = await Media.findById(mediaId);
    const user = await User.findById(userId);
    if (!media || !user) {
      throw new Error("Your required content does not exist!");
    }

    await media.likes.pull(userId);

    await media.save();

    return { message: `Disliked media ${mediaId}` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getCommentsByMediaId = async (
  mediaId: string
): Promise<CommentResponseDTO[]> => {
  try {
    await connectToDatabase();

    const media = await Media.findById(mediaId).populate({
      path: "comments",
      model: Comment,
    });

    if (!media) {
      throw new Error("Media not found");
    }

    const comments: CommentResponseDTO[] = media.comments.map(
      (comment: any) => {
        return {
          _id: comment._id.toString(),
          content: comment.content,
          userId: comment.userId,
          createdTime: comment.createdAt,
          replies: comment.replies,
          createBy: comment.createBy,
          createAt: comment.createdAt,
        };
      }
    );

    return comments;
  } catch (error: any) {
    throw new Error("Error fetching comments: " + error.message);
  }
};

export const getAuthorByMediaId = async (
  mediaId: string
): Promise<UserResponseDTO> => {
  try {
    await connectToDatabase();
    const media = await Media.findById(mediaId).populate({
      path: "createBy",
      model: User,
    });
    if (!media) {
      throw new Error("media not found");
    }

    if (!media.createBy) {
      throw new Error("Author not found");
    }

    const author = media.createBy;

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
      status: author.status,
      saveIds: author.saveIds,
      likeIds: author.likeIds,
    };

    return authorDTO; // Trả về thông tin tác giả
  } catch (error: any) {
    console.error("Error fetching author: ", error);
    throw new Error("Error fetching author: " + error.message);
  }
};

export const getLikesByMediaId = async (
  mediaId: string
): Promise<UserResponseDTO[]> => {
  try {
    await connectToDatabase();

    const media = await Media.findById(mediaId).populate({
      path: "likes",
      model: User,
    });

    if (!media) {
      throw new Error("media not found");
    }

    const users: UserResponseDTO[] = media.likes.map((user: any) => {
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

export async function getMediaById(
  mediaId: string
): Promise<MediaCreateDTO | null> {
  try {
    await connectToDatabase();

    const media = await Media.findById(mediaId)
      .populate("createBy", "firstName lastName avatar _id")
      .populate("likes")
      .populate("comments");

    if (!media) {
      throw new Error("media not found");
    }

    return media;
  } catch (error) {
    console.error("Error fetching media by ID:", error);
    throw error;
  }
}
