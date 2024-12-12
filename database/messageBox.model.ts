import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

// Interface cho MessageBox
export interface IMessageBox extends Document, IAudit {
  senderId: Schema.Types.ObjectId; // ID của người gửi
  receiverIds: Schema.Types.ObjectId[]; // Danh sách ID của người nhận
  messageIds: Schema.Types.ObjectId[]; // Danh sách ID tin nhắn
  groupName?: string; // Tên nhóm (tuỳ chọn)
  groupAva?: string; // Ảnh đại diện nhóm (tuỳ chọn)
  status: boolean; // Trạng thái của MessageBox (true/false)
}

// Schema của MessageBox
const MessageBoxSchema = new Schema<IMessageBox>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Người gửi
  receiverIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ], // Danh sách người nhận
  messageIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ], // Danh sách tin nhắn
  groupName: {
    type: String,
    default: null,
  }, // Tên nhóm (mặc định là null)
  groupAva: {
    type: String,
    default: null,
  }, // Ảnh đại diện nhóm (mặc định là null)
  status: {
    type: Boolean,
    required: true,
    default: true,
  }, // Trạng thái
});

// Thêm AuditSchema để theo dõi dữ liệu (ngày tạo, người sửa)
MessageBoxSchema.add(AuditSchema);

// Tạo hoặc sử dụng model MessageBox
const MessageBox =
  models.MessageBox || model<IMessageBox>("MessageBox", MessageBoxSchema);

export default MessageBox;
