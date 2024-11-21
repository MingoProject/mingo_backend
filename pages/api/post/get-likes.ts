import { CommentResponseDTO } from "@/dtos/CommentDTO";
import { MediaResponseDTO } from "@/dtos/MediaDTO";
import { UserResponseDTO } from "@/dtos/UserDTO";
import { getLikesByPostId } from "@/lib/actions/post.action";
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDTO[] | { message: string }>
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { postId } = req.query;

        if (!postId) {
          return res.status(400).json({ message: "Post ID is required" });
        }

        const posts = await getLikesByPostId(postId as string);

        res.status(200).json(posts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
