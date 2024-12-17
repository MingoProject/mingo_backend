import { PostResponseDTO } from "@/dtos/PostDTO";
import { fetchPostsWithQuery, getAllPosts } from "@/lib/actions/post.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostResponseDTO[] | { message: string }>
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { query } = req.query;
        if (!query) {
          return res.status(400).json({ message: "query is required" });
        }
        const posts = await fetchPostsWithQuery(query as string);
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
