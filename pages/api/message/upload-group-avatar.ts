import type { NextApiRequest, NextApiResponse } from "next";
import { uploadAvatar } from "@/lib/actions/user.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import cloudinary from "@/cloudinary";
import { IncomingForm } from "formidable";
import { uploadGroupAvatar } from "@/lib/actions/message.action";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        const form = new IncomingForm();
        const { boxId } = req.query;
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Form parsing error:", err);
            return res.status(500).json({ error: err.message });
          }

          if (!boxId) {
            return res.status(400).json({ message: "boxId is required" });
          }

          if (files.file) {
            try {
              const file = Array.isArray(files.file)
                ? files.file[0]
                : files.file;
              const result = await cloudinary.uploader.upload(file.filepath, {
                folder: "Avatar",
              });

              await uploadGroupAvatar(
                boxId as string,
                result.secure_url,
                result.public_id
              );
              return res.status(200).json({
                status: true,
                message: "Update successfully!",
                result,
              });
            } catch (error) {
              console.error("Cloudinary upload error:", error);
              return res.status(500).json({ error: "Failed to upload image" });
            }
          } else {
            return res.status(400).json({ error: "No file uploaded" });
          }
        });
      } else {
        return res.status(405).json({ error: "Method not allowed" });
      }
    });
  });
};

export default handler;
