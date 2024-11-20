// // import { connectToDatabase } from "../../../lib/mongoose"; // Assuming you have a function to connect to your DB
// // import mongoose from "mongoose";
// // import cloudinary from "@/cloudinary"; // Ensure cloudinary is properly initialized
// // import { MediaCreateDTO, MediaResponseDTO } from "@/dtos/MediaDTO";
// // import Media from "@/database/media.model"; // Assuming you have a Media model
// // import corsMiddleware, {
// //   authenticateToken,
// // } from "@/middleware/auth-middleware";
// // import type { NextApiRequest, NextApiResponse } from "next";
// // import { createMedia } from "@/lib/actions/media.action";

// // export default async function handler(
// //   req: NextApiRequest,
// //   res: NextApiResponse
// // ) {
// //   corsMiddleware(req, res, async () => {
// //     authenticateToken(req, res, async () => {
// //       if (req.method === "POST") {
// //         try {
// //           const params: MediaCreateDTO = req.body;

// //           const newMedia: MediaResponseDTO = await createMedia(
// //             params,
// //             req.user?.id
// //           );

// //           return res.status(201).json(newMedia);
// //         } catch (error) {
// //           console.error(error);

// //           if (error instanceof Error) {
// //             return res.status(400).json({ message: error.message });
// //           }
// //           return res
// //             .status(500)
// //             .json({ message: "An unexpected error occurred." });
// //         }
// //       } else {
// //         return res.status(405).json({ message: "Method Not Allowed" });
// //       }
// //     });
// //   });
// // }

// import { createMedia } from "@/lib/actions/media.action";
// import { MediaCreateDTO, MediaResponseDTO } from "@/dtos/MediaDTO";
// import type { NextApiRequest, NextApiResponse } from "next";
// import corsMiddleware, {
//   authenticateToken,
// } from "@/middleware/auth-middleware";
// import cloudinary from "@/cloudinary";
// import Media from "@/database/media.model";
// import { connectToDatabase } from "@/lib/mongoose";
// import formidable from "formidable";
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   await corsMiddleware(req, res, async () => {
//     authenticateToken(req, res, async () => {
//       if (req.method !== "POST") {
//         return res.status(405).json({ message: "Method not allowed" });
//       }

//       try {
//         await connectToDatabase();

//         const form = formidable({ multiples: false });

//         form.parse(req, async (err, fields, files) => {
//           if (err) {
//             console.error("Formidable error:", err);
//             return res.status(500).json({ message: "File upload error" });
//           }

//           if (files.file) {
//             const file = Array.isArray(files.file) ? files.file[0] : files.file;
//             const result = await cloudinary.uploader.upload(file.filepath, {
//               folder: "Avatar",
//             });

//             const mediaData = {
//               url: result.secure_url,
//               type: fields.type,
//               caption: fields.caption || "",
//               createdAt: new Date(),
//               createdBy: req.user?.id || null, // Sử dụng middleware JWT để lấy userId
//               shares: [],
//               likes: [],
//               comments: [],
//               publicId: result.public_id,
//             };

//             const newMedia = await Media.create(mediaData);

//             return res.status(201).json(newMedia);
//           } else {
//             return res.status(400).json({ error: "No file uploaded" });
//           }
//         });
//       } catch (error) {
//         console.error("Error creating media:", error);
//         res.status(500).json({ message: "Server error" });
//       }
//     });
//   });
// }

import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import cloudinary from "@/cloudinary";
import Media from "@/database/media.model";
import { connectToDatabase } from "@/lib/mongoose";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";

export const config = {
  api: {
    bodyParser: false, // Bắt buộc phải tắt bodyParser khi sử dụng formidable
  },
};

// Hàm tiện ích để xử lý formidable với Promise
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
      }

      try {
        await connectToDatabase();

        // Sử dụng Promise để xử lý form
        const { fields, files } = await parseForm(req);

        // Kiểm tra file upload
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file || !file.filepath) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Upload lên Cloudinary
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: "Avatar",
        });

        // Tạo dữ liệu Media trong MongoDB
        const mediaData = {
          url: result.secure_url,
          type: fields.type,
          caption: fields.caption || "",
          createdAt: new Date(),
          createdBy: req.user?.id || null, // Middleware phải gắn user
          shares: [],
          likes: [],
          comments: [],
          publicId: result.public_id,
        };

        const newMedia = await Media.create(mediaData);

        return res.status(201).json(newMedia);
      } catch (error) {
        console.error("Error creating media:", error);
        return res.status(500).json({ message: "Server error" });
      }
    });
  });
}
