// import { MediaResponseDTO } from "@/dtos/MediaDTO";
// import { getAllComments } from "@/lib/actions/comment.action";
// import { getAllMedias } from "@/lib/actions/media.action";
// import corsMiddleware, {
//   authenticateToken,
// } from "@/middleware/auth-middleware";
// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<MediaResponseDTO[] | { message: string }>
// ) {
//   corsMiddleware(req, res, async () => {
//     // authenticateToken(req, res, async () => {
//     if (req.method === "GET") {
//       try {
//         const medias = await getAllMedias();
//         res.status(200).json(medias);
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error" });
//       }
//     } else {
//       res.setHeader("Allow", ["GET"]);
//       res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
//   });
//   //   });
// }
