import { getImageList } from "@/lib/actions/message.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "GET") {
        try {
          const { boxId } = req.query;
          if (!boxId) {
            return res
              .status(400)
              .json({ message: "chatId or groupId is required" });
          }

          const result = await getImageList(boxId as string);
          res.status(200).json(result);
        } catch (error) {
          console.error("Error fetching image messages: ", error);
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
  });
}
