// actions/report.action.ts
import Report from "@/database/report.model"; // Import model Report
import { ReportCreateDTO, ReportResponseDTO } from "@/dtos/reportDTO"; // DTO cho báo cáo
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../mongoose";

export async function createReport(
  params: ReportCreateDTO,
  createBy: Schema.Types.ObjectId | undefined
): Promise<ReportResponseDTO> {
  try {
    await connectToDatabase();

    // Tạo dữ liệu báo cáo
    const reportData = {
      title: params.title || "",
      content: params.content,
      reportedId: params.reportedId,
      reportedEntityId: params.reportedEntityId,
      entityType: params.entityType,
      status: "pending", // Trạng thái báo cáo (e.g., "pending", "resolved", etc.)
      createdAt: new Date(),
      createdById: createBy ? createBy : new mongoose.Types.ObjectId(), // ID của người tạo báo cáo
      attachments: params.attachments || [], // Các file đính kèm (nếu có)
      proofs: params.proofs || [], // Các bằng chứng (nếu có)
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    };

    // Tạo báo cáo mới trong DB
    const newReport = await Report.create(reportData);

    return newReport as ReportResponseDTO;
  } catch (error) {
    console.error("Error creating report:", error);
    throw new Error("Error creating report: " + error);
  }
}
