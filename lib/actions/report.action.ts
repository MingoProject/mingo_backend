// actions/report.action.ts
import Report from "@/database/report.model"; // Import model Report
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import {
  CommentReportCreateDTO,
  ReportCreateDTO,
  ReportResponseDTO,
} from "@/dtos/ReportDTO";

export async function createReport(
  params: ReportCreateDTO,
  createBy: Schema.Types.ObjectId | undefined
): Promise<ReportResponseDTO> {
  try {
    await connectToDatabase();

    console.log(createBy, "createBy");
    console.log(params);
    // Tạo dữ liệu báo cáo
    const reportData = {
      title: params.title || "",
      content: params.content,
      reportedId: params.reportedId,
      createdById: createBy, // ID của người tạo báo cáo
      reportedEntityId: params.reportedEntityId,
      entityType: params.entityType,
      status: 0, // Trạng thái báo cáo (e.g., "pending", "resolved", etc.)
      createdAt: new Date(),
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

export async function createCommentReport(
  params: CommentReportCreateDTO,
  createBy: Schema.Types.ObjectId | undefined
): Promise<ReportResponseDTO> {
  try {
    await connectToDatabase();

    console.log(createBy, "createBy");
    console.log(params);
    // Tạo dữ liệu báo cáo
    const reportData = {
      title: params.title || "",
      content: params.content,
      reportedId: params.reportedId,
      createdById: createBy, // ID của người tạo báo cáo
      reportedEntityId: params.reportedEntityId,
      parentReportEntityId: params.parentReportEntityId,
      entityType: params.entityType,
      status: 0, // Trạng thái báo cáo (e.g., "pending", "resolved", etc.)
      createdAt: new Date(),
      attachments: params.attachments || [], // Các file đính kèm (nếu có)
      proofs: params.proofs || [], // Các bằng chứng (nếu có)
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
    };

    // Tạo báo cáo mới trong DB
    const newReport = await Report.create(reportData);

    console.log(newReport, "kkkk");

    return newReport as ReportResponseDTO;
  } catch (error) {
    console.error("Error creating report:", error);
    throw new Error("Error creating report: " + error);
  }
}

export async function updateReportStatus(
  reportId: string,
  status: 1 | 2,
  updatedBy: Schema.Types.ObjectId | undefined
): Promise<ReportResponseDTO> {
  try {
    await connectToDatabase();

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = [1, 2];
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
        updatedById: updatedBy || new mongoose.Types.ObjectId(), // Thay bằng logic kiểm tra nếu cần // Dùng ObjectId mới nếu không có giá trị
      },
      { new: true } // Trả về báo cáo đã cập nhật
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

    // Lấy tất cả báo cáo từ cơ sở dữ liệu
    const reports = await Report.find({})
      .populate({
        path: "createdById",
        model: User,
        select: "firstName lastName email avatar phoneNumber gender birthDay ",
      })
      .populate({
        path: "reportedId",
        model: User,
        select:
          "firstName lastName email avatar phoneNumber gender birthDay countReport",
      })
      .sort({ createdAt: -1 })
      .exec(); // Sắp xếp giảm dần theo ngày tạo

    const reportDTOs: ReportResponseDTO[] = reports.map((report) => ({
      _id: report._id,
      title: report.title,
      content: report.content,
      createdById: {
        id: report.createdById._id,
        firstName: report.createdById.firstName,
        lastName: report.createdById.lastName,
        avatar: report.createdById.avatar,
        dob: report.createdById.birthDay,
        phoneNumber: report.createdById.phoneNumber,
        email: report.createdById.email,
        gender: report.createdById.gender,
      },
      reportedId: {
        id: report.reportedId._id,
        firstName: report.reportedId.firstName,
        lastName: report.reportedId.lastName,
        avatar: report.reportedId.avatar,
        dob: report.reportedId.birthDay,
        phoneNumber: report.reportedId.phoneNumber,
        email: report.reportedId.email,
        gender: report.reportedId.gender,
        countReport: report.reportedId.countReport,
      },
      reportedEntityId: report.reportedEntityId,
      entityType: report.entityType,
      status: report.status,
      createdAt: report.createdAt,
      attachments: report.attachments || [],
      proofs: report.proofs || [],
      parentReportEntityId: report.parentReportEntityId || "",
    }));
    return reportDTOs;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Error fetching reports: " + error);
  }
}

export const countReports = async () => {
  try {
    const count = await Report.countDocuments();
    return count;
  } catch (error: any) {
    throw new Error("Error counting reports: " + error.message);
  }
};

export const countReportsBycreatedDate = async () => {
  try {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate).setDate(
      new Date(currentDate).getDate() + 1
    );

    const count = await Report.countDocuments({
      createdDate: { $gte: currentDate, $lt: nextDay },
    });

    return count;
  } catch (error: any) {
    throw new Error("Error counting reports by createdDate: " + error.message);
  }
};

export async function updateReportUserCount(
  reportId: string,
  updatedBy: Schema.Types.ObjectId | undefined
): Promise<ReportResponseDTO> {
  try {
    await connectToDatabase();

    console.log(reportId);

    const updatedReport = await User.findByIdAndUpdate(
      reportId,
      {
        $inc: { countReport: 1 }, // Tăng countReport lên 1
        updatedAt: new Date(),
        updatedById: updatedBy || new mongoose.Types.ObjectId(),
      },
      { new: true } // Trả về báo cáo đã cập nhật
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
