import cloudinary from "@/cloudinary";
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

// export async function createMedia(
//   params: MediaCreateDTO,
//   createBy: mongoose.Schema.Types.ObjectId | undefined
// ): Promise<MediaResponseDTO> {
//   try {
//     await connectToDatabase();
//     const mediaData = {
//       url: params.url,
//       type: params.type,
//       caption: params.caption || "",
//       createdAt: new Date(),
//       createdBy: createBy || new mongoose.Types.ObjectId(),
//       shares: [],
//       likes: [],
//       comments: [],
//     };

//     const newMedia = await Media.create(mediaData);
//     return newMedia as MediaResponseDTO;
//   } catch (error) {
//     console.error("Error creating media:", error);
//     throw error;
//   }
// }

export async function createMedia(
  params: MediaCreateDTO,
  createBy: mongoose.Schema.Types.ObjectId | undefined
): Promise<MediaResponseDTO> {
  try {
    await connectToDatabase();

    const file = params.url;

    if (!file) {
      throw new Error("No file provided");
    }
    const result = await cloudinary.uploader.upload(file, {
      folder: "Media",
    });

    const mediaData = {
      url: result.secure_url,
      type: params.type,
      caption: params.caption || "",
      createdAt: new Date(),
      createdBy: createBy || new mongoose.Types.ObjectId(),
      shares: [],
      likes: [],
      comments: [],
      publicId: result.public_id,
    };

    const newMedia = await Media.create(mediaData);

    return newMedia as MediaResponseDTO;
  } catch (error) {
    console.error("Error creating media:", error);
    throw error;
  }
}
