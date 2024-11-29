import { checkRelation } from "@/lib/actions/relation.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { stUser, ndUser } = req.query;

        if (!stUser || !ndUser) {
          return res
            .status(400)
            .json({ message: "Missing required parameters." });
        }

        const highestRelation = await checkRelation(
          stUser as string,
          ndUser as string
        );

        if (!highestRelation) {
          return res
            .status(200)
            .json({ relation: null, message: "No relation found." });
        }

        return res.status(200).json(highestRelation);
      } catch (error) {
        console.error("Error checking relation:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });
}
