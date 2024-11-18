import { SegmentMessageDTO } from "@/dtos/MessageDTO";
import { createMessage, editMessage } from "@/lib/actions/message.action";
import { authenticateToken } from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await authenticateToken(req, res, async () => {
    if (req.method === "PUT") {
      try {
        const { messageId, contentId, newContent, userId } = req.body as {
          messageId: string;
          contentId: string;
          newContent: SegmentMessageDTO["content"];
          userId: string;
        };

        if (!messageId) {
          return res
            .status(400)
            .json({ success: false, message: "Message id is required" });
        }

        const result = await editMessage(
          messageId,
          contentId,
          newContent,
          userId
        );

        if (result.success) {
          return res.status(200).json({
            message: "Edit message successfully!",
            result: result.updatedMessage,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: result.message,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ success: false, message: errorMessage });
      }
    } else {
      res.setHeader("Allow", ["PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
