import { SegmentMessageDTO } from "@/dtos/MessageDTO";
import { NextApiRequest, NextApiResponse } from "next/types";
import { authenticateToken } from "@/middleware/auth-middleware";
import { createGroup } from "@/lib/actions/message.action";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      const { adminId, memberIds } = req.body;
      if (!Array.isArray(memberIds) || memberIds.length <= 1) {
        return res.status(400).json({
          success: false,
          message: "Member of group must be large than 2",
        });
      }

      if (!adminId) {
        return res.status(400).json({
          success: false,
          messgae: "Admin id is required",
        });
      }

      try {
        const result = await createGroup(adminId, memberIds);

        return res.status(200).json({ success: true, data: result });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({
          success: false,
          message: errorMessage,
        });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allow`);
    }
  });
}
