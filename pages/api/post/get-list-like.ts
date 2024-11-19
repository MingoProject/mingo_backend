import { PostResponseDTO, PostYouLikeDTO } from "@/dtos/PostDTO";
import { getLikedPosts } from "@/lib/actions/post.action";
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostYouLikeDTO[] | { message: string }>
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { userId } = req.query;

        // Kiểm tra và chuyển đổi userId thành chuỗi
        if (!userId || Array.isArray(userId) || typeof userId !== "string") {
          return res.status(400).json({ message: "Invalid userId provided" });
        }

        // Gọi hàm lấy danh sách bài viết đã thích
        const likedPosts = await getLikedPosts(userId);
        console.log("Posts found:", userId);

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
