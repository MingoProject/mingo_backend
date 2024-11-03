import OTP from "@/database/otp.model";
import { SingleMessageResponseDTO } from "@/dtos/ShareDTO";
import { connectToDatabase } from "@/lib/mongoose";
import { authenticateToken } from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp) {
        return res
          .status(400)
          .json({ error: "Phone number and OTP are required" });
      }

      connectToDatabase();
      console.log("User: ", req.user?.id);
      const storedOtp = await OTP.findOne({ receiver: phoneNumber });
      if (storedOtp.code === otp) {
        const result: SingleMessageResponseDTO = {
          message: "Verify OTP successfully",
        };
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: "Invalid OTP" });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
