import { IChat } from "@/database/chat.model";
import { getAllChat } from "@/lib/actions/message.action";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IChat[] | { message: string }>
) {
  if (req.method === "GET") {
    const { userId } = req.query; // Lấy userId từ query params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      const chats = await getAllChat(userId as string); // Gọi action để lấy tất cả các cuộc trò chuyện
      res.status(200).json(chats); // Trả về danh sách các cuộc trò chuyện
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to fetch chats" }); // Trả lỗi nếu có
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`); // Nếu không phải GET, trả lỗi Method Not Allowed
  }
}
