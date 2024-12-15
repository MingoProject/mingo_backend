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

    const reportData = {
      title: params.title || "",
      content: params.content,
      reportedId: params.reportedId,
      reportedEntityId: params.reportedEntityId,
      entityType: params.entityType,
      status: "pending",
      createdAt: new Date(),
      createdById: createBy ? createBy : new mongoose.Types.ObjectId(),
      attachments: params.attachments || [],
      proofs: params.proofs || [],
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    };

    const newReport = await Report.create(reportData);

    return newReport as ReportResponseDTO;
  } catch (error) {
    console.error("Error creating report:", error);
    throw new Error("Error creating report: " + error);
  }
}

export async function updateReportStatus(
  reportId: string,
  status: "done" | "reject",
  updatedBy: Schema.Types.ObjectId | undefined
): Promise<ReportResponseDTO> {
  try {
    await connectToDatabase();

    const validStatuses = ["done", "reject"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        "Invalid status value. Allowed values are 'done' or 'reject'."
      );
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        status: status,
        updatedAt: new Date(),
        updatedById: updatedBy || new mongoose.Types.ObjectId(),
      },
      { new: true }
    );

    if (!updatedReport) {
      throw new Error("Report not found");
    }

    return updatedReport as ReportResponseDTO;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw new Error("Error updating report status: " + error);
  }
}

export async function getAllReports(): Promise<ReportResponseDTO[]> {
  try {
    await connectToDatabase();

    const reports = await Report.find({}).sort({ createdAt: -1 }).exec(); // Sắp xếp giảm dần theo ngày tạo

    return reports as ReportResponseDTO[];
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Error fetching reports: " + error);
  }
}
