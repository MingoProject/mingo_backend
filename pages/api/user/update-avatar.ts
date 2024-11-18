import { NextApiRequest, NextApiResponse } from "next";
import { UpdateAvatarDTO } from "@/dtos/UserDTO";
import { updateAvatar } from "@/lib/actions/user.action";
import { authenticateToken } from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  authenticateToken(req, res, async () => {
    if (req.method === "PATCH") {
      try {
        const params: UpdateAvatarDTO = req.body;
        const updatedAvatar = await updateAvatar(req.user?.id, params);

        if (!updatedAvatar) {
          return res.status(404).json({ error: "User not found" });
        }

        res
          .status(200)
          .json({ message: "Avatar updated successfully", updatedAvatar });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      res.setHeader("Allow", ["PATCH"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
