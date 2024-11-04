import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IImage extends Document, IAudit {
  fileName: string;
  path: string;
  size: number;
}

const ImageSchema = new Schema<IImage>({
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
});

ImageSchema.add(AuditSchema);

const Image = models.Image || model("Image", ImageSchema);

export default Image;
