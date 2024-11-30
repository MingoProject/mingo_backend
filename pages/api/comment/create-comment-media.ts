// pages/api/comments/create.ts
import { createCommentMedia } from "@/lib/actions/comment.action";
import { CreateCommentDTO, CommentResponseDTO } from "@/dtos/CommentDTO";
import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          const { mediaId } = req.query;
          if (typeof mediaId !== "string") {
            return res.status(400).json({ message: "Invalid mediaId" });
          }
          const params: CreateCommentDTO = req.body;

          const newComment: CommentResponseDTO = await createCommentMedia(
            params,
            req.user?.id,
            mediaId
          );

          return res.status(201).json(newComment);
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
  });
}
