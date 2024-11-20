import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IVoice extends Document, IAudit {
  fileName: string;
  path: string;
  size: number;
}

const VoiceSchema = new Schema<IVoice>({
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
});

VoiceSchema.add(AuditSchema);

const Voice = models.Voice || model("Voice", VoiceSchema);

export default Voice;
