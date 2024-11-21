import { AuditSchema, IAudit } from "./audit.model";
import { Schema, models, model, Document } from "mongoose";

export interface IVideo extends Document, IAudit {
  fileName: string;
  path: string;
  size: number;
}

const VideoSchema = new Schema<IVideo>({
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
});

VideoSchema.add(AuditSchema);

const Video = models.Video || model("Video", VideoSchema);

export default Video;
