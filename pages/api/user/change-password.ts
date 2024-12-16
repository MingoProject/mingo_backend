import { UserRegisterDTO, UserResponseDTO } from "@/dtos/UserDTO";
import { changePassword, createUser } from "@/lib/actions/user.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          const { currentPassword, newPassword } = req.body;

          const response = await changePassword(
            req.user?.id,
            currentPassword,
            newPassword
          );

          return res.status(200).json(response);
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
