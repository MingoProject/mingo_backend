import { NextApiRequest, NextApiResponse } from "next/types";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { createNotification } from "@/lib/actions/notification.action";
import { CreateNotificationDTO } from "@/dtos/NotificationDTO"; // Import DTO cho notification

// export default async function handle(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   corsMiddleware(req, res, async () => {
//     authenticateToken(req, res, async () => {
//       if (req.method === "POST") {
//         try {
//           const data: CreateNotificationDTO = req.body;

//           const result = await createNotification(data);

//           return res.status(200).json(result);
//         } catch (error) {
//           const errorMessage =
//             error instanceof Error ? error.message : "unknown error";
//           return res
//             .status(500)
//             .json({ success: false, message: errorMessage });
//         }
//       } else {
//         return res.status(405).json({ message: "Method Not Allowed" });
//       }
//     });
//   });
// }

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      try {
        const data: CreateNotificationDTO = req.body;

        const result = await createNotification(data);

        return res.status(200).json(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "unknown error";
        return res.status(500).json({ success: false, message: errorMessage });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
