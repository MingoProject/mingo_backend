import { NextApiRequest, NextApiResponse } from "next";
import { UpdateBackgroundDTO } from "@/dtos/UserDTO";
import { updateBackground } from "@/lib/actions/user.action";
import { authenticateToken } from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  authenticateToken(req, res, async () => {
    if (req.method === "PATCH") {
      try {
        const params: UpdateBackgroundDTO = req.body;

        const updatedBackgroundResult = await updateBackground(
          req.user?.id,
          params
        );

        if (!updatedBackgroundResult) {
          return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
          message: "Background updated successfully",
          updatedBackground: updatedBackgroundResult.updatedBackground,
        });
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
