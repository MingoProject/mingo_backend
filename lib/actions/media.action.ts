import { connectToDatabase } from "../mongoose";
import Media from "@/database/media.model";
import User from "@/database/user.model";
import { MediaCreateDTO, MediaResponseDTO } from "@/dtos/MediaDTO";
import mongoose, { Schema } from "mongoose";

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

export async function getMediaById(
  mediaId: string
): Promise<MediaCreateDTO | null> {
  try {
    await connectToDatabase();

    const media = await Media.findById(mediaId).populate(
      "createBy",
      "firstName lastName avatar _id"
    );

    if (!media) {
      throw new Error("media not found");
    }

    return media;
  } catch (error) {
    console.error("Error fetching media by ID:", error);
    throw error;
  }
}
