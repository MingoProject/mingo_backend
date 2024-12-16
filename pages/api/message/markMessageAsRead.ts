import {
  checkMarkMessageAsRead,
  getImageList,
  markMessageAsRead,
} from "@/lib/actions/message.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next/types";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          if (req.user && req.user.id) {
            const { boxId } = req.query;
            const { userId } = req.query;
            //const userId = req.user.id.toString();

            if (!boxId) {
              return res.status(400).json({ message: "boxId is required" });
            }

            const result = await markMessageAsRead(
              boxId as string,
              userId as string
            );
            res.status(200).json(result);
          } else {
            return res.status(403).json({
              message: "Forbidden: You do not have the required role",
            });
          }
        } catch (error) {
          console.error("Error marking messages as read: ", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          res
            .status(500)
            .json({ message: "Internal Server Error", error: errorMessage });
        }
      } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    });
  });
}