import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IText extends Document, IAudit {
  content: string;
}

const TextSchema = new Schema<IText>({
  content: { type: String, required: true },
});

TextSchema.add(AuditSchema);

const Text = models.Text || model("Text", TextSchema);

export default Text;
