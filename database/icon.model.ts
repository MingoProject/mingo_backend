import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IIcon extends Document, IAudit {
  content: string;
}

const IconSchema = new Schema<IIcon>({
  content: { type: String, required: true },
});

IconSchema.add(AuditSchema);

const Icon = models.Icon || model("Icon", IconSchema);

export default Icon;
