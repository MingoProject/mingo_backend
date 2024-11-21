import { SegmentMessageDTO } from "@/dtos/MessageDTO";
import { NextApiRequest, NextApiResponse } from "next/types";
import { authenticateToken } from "@/middleware/auth-middleware";
import { fetchMessage } from "@/lib/actions/message.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    SegmentMessageDTO[] | { message: string; error?: string }
  >
) {
  authenticateToken(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { chatId } = req.query;
        if (!chatId) {
          return res
            .status(400)
            .json({ message: "chatId or groupId is required" });
        }

        const { success, messages } = await fetchMessage(chatId as string);

        if (!success) {
          return res.status(404).json({ message: "Messages not found" });
        }

        res.status(200).json(messages);
      } catch (error) {
        console.error("Error fetching messages: ", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res
          .status(500)
          .json({ message: "Internal Server Error", error: errorMessage });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
