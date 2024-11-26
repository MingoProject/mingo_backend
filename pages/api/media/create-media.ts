import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "@/middleware/auth-middleware";
import cloudinary from "@/cloudinary";
import { IncomingForm } from "formidable";
import { createMedia } from "@/lib/actions/media.action";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      const form = new IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          return res.status(500).json({ error: err.message });
        }

        const { caption } = fields;
        const captionString = Array.isArray(caption) ? caption[0] : caption;
        if (files.file) {
          try {
            const file = Array.isArray(files.file) ? files.file[0] : files.file;

            const result = await cloudinary.uploader.upload(file.filepath, {
              folder: "Media",
              resource_type: "auto",
            });

            const data = {
              url: result.secure_url,
              type: result.resource_type,
              caption: captionString || "",
            };

            const media = await createMedia(data, req.user?.id);

            return res.status(200).json({
              status: true,
              message: "Media uploaded successfully!",
              media,
            });
          } catch (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ error: "Failed to upload media" });
          }
        } else {
          return res.status(400).json({ error: "No file uploaded" });
        }
      });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  });
};

export default handler;
