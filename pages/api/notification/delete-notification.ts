import { NextApiRequest, NextApiResponse } from "next/types";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { deleteNotification } from "@/lib/actions/notification.action";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "DELETE") {
        try {
          const { notificationId } = req.query;
          if (!notificationId) {
            return res
              .status(400)
              .json({ message: "notification ID is required" });
          }

          const result = await deleteNotification(notificationId as string);

          return res.status(200).json(result);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "unknown error";
          return res
            .status(500)
            .json({ success: false, message: errorMessage });
        }
      } else {
        return res.status(405).json({ message: "Method Not Allowed" });
      }
    });
  });
}
