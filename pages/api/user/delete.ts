// pages/api/users/deleteUser.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { deleteUser } from "@/lib/actions/user.action";
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
      const { userId } = req.query;

      // Kiểm tra nếu `userId` không tồn tại hoặc không hợp lệ
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ message: "User ID is required" });
      }

      try {
        const result = await deleteUser(userId);
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "An error occurred while deleting the user" });
      }
    });
  });
}
