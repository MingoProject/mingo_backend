import { NextApiRequest, NextApiResponse } from "next/types";
import { createCall } from "@/lib/actions/call.action"; // Import the createCall function
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS and authentication
  await corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      try {
        const { callerId, receiverId, callType, startTime, status, endTime } =
          req.body;

        console.log(req.body, "req.body");

        // Validate required fields
        if (!callerId || !receiverId || !callType || !startTime) {
          return res.status(400).json({
            message:
              "Missing required fields: callerId, receiverId, callType, startTime",
          });
        }

        // Call the createCall function
        const result = await createCall({
          callerId,
          receiverId,
          callType,
          startTime: new Date(startTime),
          createBy: callerId, // Pass the user ID to createBy
          status,
          endTime: endTime,
        });

        // Respond with success message and result
        return res.status(200).json(result);
      } catch (error) {
        // Log the error and return a response
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      // Handle unsupported HTTP methods

      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
