import { FriendRequestDTO } from "@/dtos/FriendDTO";
import { unBFF } from "@/lib/actions/friend.action";
import corsMiddleware from "@/middleware/auth-middleware";
import cors, { authenticateToken } from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          const param: FriendRequestDTO = req.body;
          const requestedRelation = await unBFF(param);
          return res.status(201).json(requestedRelation);
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
