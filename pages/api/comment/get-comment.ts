import { PostResponseDTO } from "@/dtos/PostDTO";
import { getCommentById } from "@/lib/actions/comment.action";
import { getPostById } from "@/lib/actions/post.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { commentId } = req.query;

        if (!commentId) {
          return res.status(400).json({ message: "Comment ID is required" });
        }
        const comment = await getCommentById(commentId as string);
        res.status(200).json(comment);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
