import {
  checkMarkMessageAsRead,
  getImageList,
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
      if (req.method === "GET") {
        try {
          if (req.user?.id) {
            const { boxIds } = req.query;
            const userId = req.user.id;

            if (!boxIds || (Array.isArray(boxIds) && boxIds.length === 0)) {
              return res.status(400).json({ message: "boxIds are required" });
            }

            const boxIdArray = Array.isArray(boxIds) ? boxIds : [boxIds];

            const result = await checkMarkMessageAsRead(
              boxIdArray,
              userId.toString()
            );
            return res.status(200).json(result);
          }

          return res.status(403).json({
            message: "Forbidden: You do not have the required role",
          });
        } catch (error) {
          console.error("Error fetching image messages: ", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          return res.status(500).json({
            message: "Internal Server Error",
            error: errorMessage,
          });
        }
      }

      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    });
  });
}
