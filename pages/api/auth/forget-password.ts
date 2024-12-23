import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware from "@/middleware/auth-middleware";
import { forgetPassword } from "@/lib/actions/user.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    try {
      const { phoneNumber, newPassword } = req.body;

      if (!phoneNumber || !newPassword) {
        return res
          .status(400)
          .json({ message: "Phone number and new password are required" });
      }

      const response = await forgetPassword(phoneNumber, newPassword);

      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
}
