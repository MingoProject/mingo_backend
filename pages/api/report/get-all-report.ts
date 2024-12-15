// pages/api/report/getAll.ts
import { getAllReports } from "@/lib/actions/report.action"; // Import logic lấy danh sách báo cáo
import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware"; // Middleware xác thực token người dùng

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // authenticateToken(req, res, async () => {
  //   if (req.method === "GET") {
  //     try {
  //       // Gọi action để lấy danh sách báo cáo
  //       const reports = await getAllReports();

  //       return res.status(200).json(reports);
  //     } catch (error) {
  //       console.error("Error fetching reports:", error);

  //       if (error instanceof Error) {
  //         return res.status(400).json({ message: error.message });
  //       }
  //       return res
  //         .status(500)
  //         .json({ message: "An unexpected error occurred." });
  //     }
  //   } else {
  //     return res.status(405).json({ message: "Method Not Allowed" });
  //   }
  // });
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        // Gọi action để lấy danh sách báo cáo
        const reports = await getAllReports();

        console.log(reports);

        return res.status(200).json(reports);
      } catch (error) {
        console.error("Error fetching reports:", error);

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
}
