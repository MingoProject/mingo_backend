import { PostResponseDTO } from "@/dtos/PostDTO";
import { getListLike } from "@/lib/actions/post.action";
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostResponseDTO[] | { message: string }>
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
          return res.status(400).json({ message: "Invalid userId provided" });
        }

        const likedPosts = await getListLike(userId);
        res.status(200).json(likedPosts);
      } catch (error: any) {
        console.error("Error fetching liked posts: ", error);
        res
          .status(500)
          .json({ message: error.message || "Internal Server Error" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
