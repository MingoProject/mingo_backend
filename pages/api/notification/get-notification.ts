import { getNotification } from "@/lib/actions/notification.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { senderId, receiverId, type } = req.query;

        if (!senderId || !receiverId || !type) {
          return res
            .status(400)
            .json({ message: "Missing required parameters" });
        }

        // Gọi action lấy danh sách thông báo
        const notification = await getNotification(
          senderId as string,
          receiverId as string,
          type as string
        );

        return res.status(200).json(notification);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "unknown error";
        return res.status(500).json({ success: false, message: errorMessage });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
