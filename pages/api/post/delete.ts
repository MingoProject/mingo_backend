// pages/api/users/deleteUser.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { deletePost } from "@/lib/actions/post.action";
import { authenticateToken, authorizeRole } from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Kiểm tra phương thức yêu cầu
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Xác thực token và phân quyền chỉ cho admin
  authenticateToken(req, res, async () => {
    authorizeRole(["admin"])(req, res, async () => {
      const { postId } = req.query;

      // Kiểm tra nếu `userId` không tồn tại hoặc không hợp lệ
      if (!postId || typeof postId !== "string") {
        return res.status(400).json({ message: "Post ID is required" });
      }

      try {
        const result = await deletePost(postId);
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "An error occurred while deleting the post" });
      }
    });
  });
}

// // pages/api/posts/deletePost.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { deletePost, findPostById } from "@/lib/actions/post.action"; // Import thêm findPostById
// import { authenticateToken, authorizeRole } from "@/middleware/auth-middleware";
// import { getUserIdFromToken } from "@/lib/utils"; // Giả sử bạn có một hàm lấy user ID từ token

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   // Kiểm tra phương thức yêu cầu
//   if (req.method !== "DELETE") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   // Xác thực token
//   authenticateToken(req, res, async () => {
//     const userIdFromToken = getUserIdFromToken(req); // Lấy user ID từ token

//     const { postId } = req.query;

//     // Kiểm tra nếu `postId` không tồn tại hoặc không hợp lệ
//     if (!postId || typeof postId !== "string") {
//       return res.status(400).json({ message: "Post ID is required" });
//     }

//     try {
//       const post = await findPostById(postId); // Tìm bài viết theo ID

//       if (!post) {
//         return res.status(404).json({ message: "Post not found" });
//       }

//       // Kiểm tra xem người dùng hiện tại có phải là tác giả của bài viết hoặc admin không
//       if (post.author.toString() !== userIdFromToken && !req.user?.roles.includes("admin")) {
//         return res.status(403).json({ message: "You do not have permission to delete this post" });
//       }

//       const result = await deletePost(postId);
//       return res.status(200).json(result);
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json({ message: "An error occurred while deleting the post" });
//     }
//   });
// }
