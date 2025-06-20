import { NextApiRequest, NextApiResponse } from "next/types";
import { getCallHistory } from "@/lib/actions/call.action"; // Import hàm getCallHistory
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "GET") {
        try {
          if (req.user && req.user.id) {
            const userId = req.user.id.toString();
            if (!userId) {
              return res.status(400).json({ message: "userId is required" });
            }
            const result = await getCallHistory(userId); // Lấy lịch sử cuộc gọi của người dùng
            res.status(200).json(result);
          } else {
            return res.status(403).json({
              message: "Forbidden: You do not have the required role",
            });
          }
        } catch (error) {
          console.error("Error fetching call history: ", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          res
            .status(500)
            .json({ message: "Internal Server Error", error: errorMessage });
        }
      } else {
        res.setHeader("Allow", ["GET", "OPTIONS"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    });
  });
}
