import { savePost } from "@/lib/actions/user.action";
import { PostCreateDTO, PostResponseDTO } from "@/dtos/PostDTO";
import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { unsavePost } from "@/lib/actions/user.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          const { postId } = req.query;
          if (!postId) {
            return res.status(400).json({ message: "Post ID is required" });
          }

          const result = await unsavePost(postId as string, req.user?.id);

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
  });
}
