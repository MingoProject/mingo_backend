import { Schema } from "mongoose";

export interface UserInfor {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  dob: Date;
  phoneNumber: string;
  email: string;
  gender: boolean;
  reportCount?: number;
}

export interface ReportCreateDTO {
  title?: string; // Tiêu đề báo cáo (tuỳ chọn)
  content: string; // Nội dung báo cáo
  createdById: Schema.Types.ObjectId;
  reportedId: Schema.Types.ObjectId; // ID của người bị báo cáo
  reportedEntityId: Schema.Types.ObjectId; // ID của thực thể bị báo cáo (Post ID, User ID, etc.)
  entityType: string; // Loại thực thể (e.g., "post", "user", etc.)
  attachments?: string[]; // Các file đính kèm (tuỳ chọn)
  proofs?: string[]; // Các bằng chứng (tuỳ chọn)
}

export interface CommentReportCreateDTO {
  title?: string; // Tiêu đề báo cáo (tuỳ chọn)
  content: string; // Nội dung báo cáo
  createdById: Schema.Types.ObjectId;
  reportedId: Schema.Types.ObjectId; // ID của người bị báo cáo
  reportedEntityId: Schema.Types.ObjectId; // ID của thực thể bị báo cáo (Post ID, User ID, etc.)
  parentReportEntityId: string;
  entityType: string; // Loại thực thể (e.g., "post", "user", etc.)
  attachments?: string[]; // Các file đính kèm (tuỳ chọn)
  proofs?: string[]; // Các bằng chứng (tuỳ chọn)
}

export interface ReportResponseDTO {
  _id: string;
  title?: string;
  content: string;
  createdById: UserInfor;
  reportedId: UserInfor; // Thêm reportedId vào đây
  reportedEntityId: string;
  parentReportEntityId?: string;
  entityType: string;
  status: number; // Trạng thái báo cáo (e.g., "pending", "resolved", etc.)
  createdAt: Date;
  attachments?: string[]; // Các file đính kèm (nếu có)
  proofs?: string[]; // Các bằng chứng (nếu có)
}
