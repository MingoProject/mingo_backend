import { UserResponseDTO } from "@/dtos/UserDTO"; // Giả sử UserResponseDTO đã được định nghĩa tương ứng
import { getTagsByPostId } from "@/lib/actions/post.action"; // Giả sử bạn có một hàm getAuthorByPostId để lấy tác giả
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

        const author = await getTagsByPostId(postId as string);

        res.status(200).json(author);
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
