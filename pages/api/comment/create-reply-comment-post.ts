import { createReplyCommentPost } from "@/lib/actions/comment.action";
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
          const { postId } = req.query;
          if (typeof postId !== "string") {
            return res.status(400).json({ message: "Invalid postId" });
          }
          const params: CreateCommentDTO = req.body;

          const newComment: CommentResponseDTO = await createReplyCommentPost(
            params,
            req.user?.id,
            postId
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
