import type { NextApiRequest, NextApiResponse } from "next";
import { getMyLikedPosts } from "@/lib/actions/user.action";
import corsMiddleware from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { userId } = req.query;

        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        const saves = await getMyLikedPosts(userId as string);

        return res.status(200).json(saves);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to retrieve saves" });
      }
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  });
}
