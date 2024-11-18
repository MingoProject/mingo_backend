import { NextApiRequest, NextApiResponse } from "next/types";
import { authenticateToken } from "@/middleware/auth-middleware";
import { createNotification } from "@/lib/actions/notification.action";
import { NotificationDTO } from "@/dtos/NotificationDTO"; // Import DTO cho notification

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Xác thực token người dùng
  await authenticateToken(req, res, async () => {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
      // Lấy dữ liệu từ request body và map nó vào DTO
      const data: NotificationDTO = req.body;

      // Gọi hàm tạo thông báo
      const result = await createNotification({
        userId: data.user_id.toString(),
        type: data.type,
        from: data.from.toString(),
        resourceId: data.resource_id.toString(),
        message: data.message, // optional
      });

      // Trả về kết quả thành công
      return res.status(200).json({
        success: true,
        message: "Notification created successfully!",
        result,
      });
    } catch (error) {
      // Xử lý lỗi
      const errorMessage =
        error instanceof Error ? error.message : "unknown error";
      return res.status(500).json({ success: false, message: errorMessage });
    }
  });
}
