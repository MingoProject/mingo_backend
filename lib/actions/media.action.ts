import { connectToDatabase } from "../mongoose";
import Media from "@/database/media.model";
import { MediaCreateDTO, MediaResponseDTO } from "@/dtos/MediaDTO";
import mongoose from "mongoose";

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
