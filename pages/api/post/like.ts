import { likePost } from "@/lib/actions/post.action";
import { PostCreateDTO, PostResponseDTO } from "@/dtos/PostDTO";
import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "@/middleware/auth-middleware";
