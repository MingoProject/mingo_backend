import { countUsersByAttendDate } from "@/lib/actions/user.action";
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const userCount = await countUsersByAttendDate();
        return res.status(200).json(userCount);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
};

export default handler;
