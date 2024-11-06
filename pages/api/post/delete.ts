import type { NextApiRequest, NextApiResponse } from "next";
import { deletePost } from "@/lib/actions/post.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { postId } = req.query;

  if (!postId || typeof postId !== "string") {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const result = await deletePost(postId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the post" });
  }
}
