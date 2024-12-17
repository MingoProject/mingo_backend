import { countReportsBycreatedDate } from "@/lib/actions/report.action";
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const reportCount = await countReportsBycreatedDate();
        return res.status(200).json(reportCount);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
};

export default handler;
