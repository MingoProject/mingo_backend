import { UserResponseDTO } from "@/dtos/UserDTO"; // Giả sử UserResponseDTO đã được định nghĩa tương ứng
import { getAuthorByPostId } from "@/lib/actions/post.action"; // Giả sử bạn có một hàm getAuthorByPostId để lấy tác giả
import corsMiddleware from "@/middleware/auth-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDTO | { message: string }>
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { postId } = req.query; // Lấy postId từ query string

        if (!postId) {
          return res.status(400).json({ message: "Post ID is required" });
        }

        // Gọi hàm getAuthorByPostId và truyền vào postId để lấy thông tin tác giả
        const author = await getAuthorByPostId(postId as string);

        res.status(200).json(author); // Trả về thông tin tác giả
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
