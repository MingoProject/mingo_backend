import mongoose, { Schema, models, model, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

// Định nghĩa interface cho IReport
export interface IReport extends Document, IAudit {
  title: string; // Tiêu đề báo cáo
  content: string; // Nội dung báo cáo
  createdById: Schema.Types.ObjectId; // Người tạo báo cáo
  reportedId: Schema.Types.ObjectId; // Người bị báo cáo
  reportedEntityId: Schema.Types.ObjectId; // ID của thực thể được báo cáo
  entityType: string; // Loại thực thể được báo cáo ("post", "user", etc.)
  status: string; // Trạng thái báo cáo ("pending", etc.)
  createdAt: Date; // Thời gian tạo báo cáo
  attachments?: string[]; // Các file đính kèm
  proofs?: string[]; // Các bằng chứng
}

// Sửa đổi schema ReportSchema
const ReportSchema = new Schema<IReport>(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedEntityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    attachments: [
      {
        type: String,
      },
    ],
    proofs: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true, // Tự động thêm `createdAt` và `updatedAt`
  }
);

// Thêm AuditSchema để hỗ trợ trường audit (nếu cần)
ReportSchema.add(AuditSchema);

// Kiểm tra hoặc khởi tạo model
const Report = models.Report || model<IReport>("Report", ReportSchema);

export default Report;
