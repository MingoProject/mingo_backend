import { UpdateUserBioDTO } from "@/dtos/UserDTO";
import { updateStatus, updateUserBio } from "@/lib/actions/user.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "PATCH") {
        try {
          const userId = req.user?.id?.toString();

          if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
          }
          const updatedUser = await updateStatus(userId);

          if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
          }

          res.status(200).json(updatedUser);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      } else {
        res.setHeader("Allow", ["PATCH"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    });
  });
}
