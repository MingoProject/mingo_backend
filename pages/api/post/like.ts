import { likePost } from "@/lib/actions/post.action";
import { PostCreateDTO, PostResponseDTO } from "@/dtos/PostDTO";
import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      try {
        const { postId } = req.query;
        if (!postId) {
          return res.status(400).json({ message: "Post ID is required" });
        }

        const result = await likePost(postId as string, req.user?.id);

        return res.status(201).json(result);
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
