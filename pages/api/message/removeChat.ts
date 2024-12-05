// pages/api/users/deleteUser.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { deleteUser } from "@/lib/actions/user.action";
import corsMiddleware, {
  authenticateToken,
  authorizeRole,
} from "@/middleware/auth-middleware";
import { removeChatBox, removeMessage } from "@/lib/actions/message.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method !== "DELETE") {
        return res.status(405).json({ message: "Method Not Allowed" });
      }

      const { boxId } = req.query;

      if (!boxId || typeof boxId !== "string") {
        return res.status(400).json({ message: "Post ID is required" });
      }

      try {
        const result = await removeChatBox(boxId);
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "An error occurred while deleting the post" });
      }
    });
  });
}
