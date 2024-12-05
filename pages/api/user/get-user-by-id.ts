import { fetchBoxChat } from "@/lib/actions/message.action";
import { NextApiRequest, NextApiResponse } from "next/types";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { getMyProfile } from "@/lib/actions/user.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        // Assuming you pass the userId as a query parameter
        const { userId } = req.query;

        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        // Call the getMyProfile function and pass the userId
        const userProfile = await getMyProfile(userId as string);

        // Respond with the user's profile
        return res.status(200).json({ userProfile });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to retrieve profile" });
      }
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  });
}
