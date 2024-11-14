import { CommentResponseDTO } from "@/dtos/CommentDTO";
import { getCommentsByPostId } from "@/lib/actions/post.action";
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommentResponseDTO[] | { message: string }>
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { postId } = req.query; // Lấy postId từ query string

        if (!postId) {
          return res.status(400).json({ message: "Post ID is required" });
        }

        // Gọi hàm getCommentsByPostId và truyền vào postId
        const posts = await getCommentsByPostId(postId as string);

        res.status(200).json(posts); // Trả về danh sách comment
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
