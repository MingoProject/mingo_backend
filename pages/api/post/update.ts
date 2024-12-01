import { PostCreateDTO } from "@/dtos/PostDTO"; // DTO cho cập nhật bài viết
import { updatePost } from "@/lib/actions/post.action"; // Hàm xử lý cập nhật bài viết
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware"; // Xác thực token
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "PATCH") {
        try {
          const params: PostCreateDTO = req.body;
          const { postId } = req.query;

          if (!postId || typeof postId !== "string") {
            return res.status(400).json({ error: "Post ID is required" });
          }

          const updatedPost = await updatePost(postId, params);

          if (!updatedPost) {
            return res.status(404).json({ error: "Post not found" });
          }

          res.status(200).json(updatedPost);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      } else {
        res.setHeader("Allow", ["PATCH"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    });
  });
}
