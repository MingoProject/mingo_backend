import { DeletOrRevokeMessage } from "@/lib/actions/message.action";
import { authenticateToken } from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next/types";
import { Types } from "mongoose";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await authenticateToken(req, res, async () => {
    if (req.method === "DELETE") {
      // Loại bỏ ký tự xuống dòng hoặc khoảng trắng
      let { messageId } = req.query;
      messageId = (messageId as string).trim();

      // Kiểm tra messageId có phải là ObjectId hợp lệ không
      if (!messageId || !Types.ObjectId.isValid(messageId)) {
        return res.status(400).json({
          success: false,
          message: "messageId không hợp lệ",
        });
      }

      try {
        const userId = req.user?.id;

        if (!userId) {
          return res.status(401).json({
            success: false,
            message: "User id không xác thực",
          });
        }

        const result = await DeletOrRevokeMessage(
          messageId,
          userId.toString(),
          "delete"
        );

        return res.status(200).json(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Lỗi không xác định";
        return res.status(500).json({
          success: false,
          message: errorMessage,
        });
      }
    } else {
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
