import { verifyOTP } from "@/lib/actions/authentication.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      const { phoneNumber, code } = req.body;

      if (!phoneNumber || !code) {
        return res.status(400).json({
          success: false,
          message: "Phone number and code are required",
        });
      }

      try {
        const result = await verifyOTP(phoneNumber, code);
        return res.status(result.success ? 200 : 400).json(result);
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message || "Internal server error",
        });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
