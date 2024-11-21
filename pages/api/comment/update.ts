import { UpdateCommentDTO } from "@/dtos/CommentDTO"; // DTO cho cập nhật bài viết
import { updateComment } from "@/lib/actions/comment.action"; // Hàm xử lý cập nhật bài viết
import { authenticateToken } from "@/middleware/auth-middleware"; // Xác thực token
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // authenticateToken(req, res, async () => {
  if (req.method === "PATCH") {
    try {
      const params: UpdateCommentDTO = req.body;
      const { commentId } = req.query;
      if (!commentId || typeof commentId !== "string") {
        return res.status(400).json({ error: "Comment ID is required" });
      }
      const updatedComment = await updateComment(commentId, params);

      if (!updatedComment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      res.status(200).json(updatedComment);
    } catch (error) {}
  } else {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // });
}
