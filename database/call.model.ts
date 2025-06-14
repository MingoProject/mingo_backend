import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface ICall extends Document, IAudit {
  callerId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  callType: "video" | "voice";
  startTime: Date;
  endTime: Date;
  status: "completed" | "missed" | "rejected" | "ongoing";
  duration: number; // seconds
}

const CallSchema = new Schema<ICall>({
  callerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  callType: { type: String, enum: ["video", "voice"], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ["completed", "missed", "rejected", "ongoing"],
    default: "ongoing",
  },
  duration: { type: Number, default: 0 },
});

// Add audit fields
CallSchema.add(AuditSchema);

// Export model
const Call = models.Call || model("Call", CallSchema);

export default Call;
