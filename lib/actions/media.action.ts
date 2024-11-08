import { connectToDatabase } from "../mongoose";
import Media from "@/database/media.model";
import { MediaCreateDTO, MediaResponseDTO } from "@/dtos/MediaDTO";
import mongoose, { Schema } from "mongoose";
export async function createMedia(
  params: MediaCreateDTO,
  createBy: Schema.Types.ObjectId | undefined
): Promise<MediaResponseDTO> {
  try {
    await connectToDatabase();
    const mediaData = {
      url: params.url,
      type: params.type,
      caption: params.caption || "",
      createdAt: new Date(),
      author: createBy ? createBy : new mongoose.Types.ObjectId(),
      postId: params.postId,
      likes: [],
      comments: [],
      shares: [],
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    };
    const newMedia = await Media.create(mediaData);
    return newMedia as MediaResponseDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
