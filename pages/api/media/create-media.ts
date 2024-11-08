import { createMedia } from "@/lib/actions/media.action";
import { MediaCreateDTO, MediaResponseDTO } from "@/dtos/MediaDTO";
import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "@/middleware/auth-middleware";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      try {
        const params: MediaCreateDTO = req.body;
        // Tạo mới Media với ID của người tạo lấy từ `req.user`
        const newMedia: MediaResponseDTO = await createMedia(
          params,
          req.user?.id
        );
        return res.status(201).json(newMedia);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          return res.status(400).json({ message: error.message });
        }
        return res
          .status(500)
          .json({ message: "An unexpected error occurred." });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
