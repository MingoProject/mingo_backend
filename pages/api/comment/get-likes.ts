import { UserResponseDTO } from "@/dtos/UserDTO";
import { getLikesByCommentId } from "@/lib/actions/comment.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDTO[] | { message: string }>
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { commentId } = req.query;

        if (!commentId) {
          return res.status(400).json({ message: "Comment ID is required" });
        }

        const users = await getLikesByCommentId(commentId as string);

        res.status(200).json(users);
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
