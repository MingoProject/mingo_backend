import { createBoxChat, createGroup } from "@/lib/actions/message.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next/types";

export const config = {
  api: {
    bodyParser: true, // Allow JSON body parsing
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }

      try {
        const { membersIds, leaderId, groupName, groupAva } = req.body;

        console.log(
          membersIds,
          leaderId,
          groupName,
          groupAva,
          "this is fortest"
        );

        if (
          !membersIds ||
          !Array.isArray(membersIds) ||
          membersIds.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message: "membersIds must be a non-empty array",
          });
        }

        if (!leaderId || typeof leaderId !== "string") {
          return res.status(400).json({
            success: false,
            message: "leaderId is required and must be a string",
          });
        }

        if (!groupName || typeof groupName !== "string") {
          return res.status(400).json({
            success: false,
            message: "groupName is required and must be a string",
          });
        }

        const result = await createBoxChat(
          membersIds,
          leaderId,
          groupName,
          groupAva
        );

        return res.status(200).json(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return res.status(500).json({ success: false, message: errorMessage });
      }
    });
  });
}
