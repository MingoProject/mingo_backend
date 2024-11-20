// pages/api/report/create.ts
import { createReport } from "@/lib/actions/report.action"; // Import logic tạo báo cáo
import { ReportCreateDTO, ReportResponseDTO } from "@/dtos/reportDTO"; // DTO cho báo cáo
import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "@/middleware/auth-middleware"; // Middleware xác thực token người dùng

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      try {
        const params: ReportCreateDTO = req.body;

        // Kiểm tra nếu user đã đăng nhập và có id
        if (!req.user?.id) {
          return res
            .status(401)
            .json({ message: "User is not authenticated." });
        }

        // Truyền `createdById` từ người dùng đăng nhập vào hàm tạo báo cáo
        const createdById = req.user.id;

        // Tạo báo cáo mới và trả về kết quả
        const newReport: ReportResponseDTO = await createReport(
          {
            ...params, // Bao gồm các trường trong params từ body request
          },
          createdById // Truyền createdById vào hàm tạo báo cáo
        );

        return res.status(201).json(newReport);
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
}
