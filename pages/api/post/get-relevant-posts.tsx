import { FriendRequestDTO } from "@/dtos/FriendDTO";
import { acceptBFFRequest } from "@/lib/actions/friend.action";
import { getRelevantPosts } from "@/lib/actions/post.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { authenticateToken } from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function hanlder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "GET") {
        try {
          const relevantPosts = await getRelevantPosts(
            req.user?.id?.toString() ?? ""
          );
          return res.status(201).json(relevantPosts);
        } catch (error) {
          console.error(error);

          if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
          }
          return res
            .status(500)
            .json({ message: "An unexpected error occurred." });
        }
      } else {
        return res.status(405).json({ message: "Method Not Allowed" });
      }
    });
  });
}
