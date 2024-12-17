// pages/api/report/create.ts
import { createCommentReport, createReport } from "@/lib/actions/report.action"; // Import logic tạo báo cáo
import {
  CommentReportCreateDTO,
  ReportCreateDTO,
  ReportResponseDTO,
} from "@/dtos/ReportDTO"; // DTO cho báo cáo
import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware"; // Middleware xác thực token người dùng

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          const params: CommentReportCreateDTO = req.body;

          const newPost: ReportResponseDTO = await createCommentReport(
            params,
            req.user?.id
          );

          console.log(newPost, "newPost");

          return res.status(201).json(newPost);
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
