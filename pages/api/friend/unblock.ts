import { FriendRequestDTO } from "@/dtos/FriendDTO";
import { unBlock } from "@/lib/actions/friend.action";
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
          console.log(param, "thiss iss paramm");
          const requestedRelation = await unBlock(param);
          console.log(requestedRelation, "thiss iss requestedRelation");

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
