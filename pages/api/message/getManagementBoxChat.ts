import {
  fetchBoxChat,
  fetchManagementBoxChat,
} from "@/lib/actions/message.action";
import { NextApiRequest, NextApiResponse } from "next/types";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const result = await fetchManagementBoxChat();
        res.status(200).json(result);
      } catch (error) {
        console.error("Error fetching messageBox: ", error);
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
}
