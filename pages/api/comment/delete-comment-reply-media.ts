import { deleteCommentReplyMedia } from "@/lib/actions/comment.action"; // Import hành động xóa bình luận
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware"; // Middleware xác thực token
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    if (req.method === "DELETE") {
      // authenticateToken(req, res, async () => {
      const { commentId, originalCommentId, mediaId } = req.query; // Lấy cả commentId và postId từ query

      if (!commentId || typeof commentId !== "string") {
        return res.status(400).json({ message: "Comment ID is required" });
      }

      if (!mediaId || typeof mediaId !== "string") {
        return res.status(400).json({ message: "Post ID is required" });
      }

      if (!originalCommentId || typeof originalCommentId !== "string") {
        return res
          .status(400)
          .json({ message: "originalComment ID is required" });
      }

      try {
        const result = await deleteCommentReplyMedia(
          commentId,
          originalCommentId,
          mediaId
        );

        if (result.status === false) {
          return res.status(404).json({ message: result.message });
        }

        return res.status(200).json({ message: result.message });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "An error occurred while deleting the comment" });
      }
      // });
    } else {
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
