import { UpdateCommentDTO } from "@/dtos/CommentDTO"; // DTO cho cập nhật bài viết
import { addReplyToComment, updateComment } from "@/lib/actions/comment.action"; // Hàm xử lý cập nhật bài viết
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
      if (req.method === "POST") {
        const { commentId, replyId } = req.body;

        if (!commentId || !replyId) {
          return res.status(400).json({
            status: false,
            message: "Comment ID and Reply ID are required.",
          });
        }

        try {
          const result = await addReplyToComment(commentId, replyId);
          res.status(200).json(result);
        } catch (error: any) {
          res.status(500).json({ status: false, message: error.message });
        }
      } else {
        res.status(405).json({ status: false, message: "Method not allowed" });
      }
    });
  });
}
