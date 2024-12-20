import { findUserByPhoneNumber } from "@/lib/actions/user.action";
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { phoneNumber } = req.query;

        if (!phoneNumber || typeof phoneNumber !== "string") {
          return res.status(400).json({ message: "Invalid phone number" });
        }
        const user = await findUserByPhoneNumber(phoneNumber);
        res.status(200).json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
