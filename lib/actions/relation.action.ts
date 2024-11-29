import Relation from "@/database/relation.model";
import { connectToDatabase } from "../mongoose";
import { isUserExists } from "./user.action";

export const checkRelation = async (
  id1: string | undefined,
  id2: string | undefined
) => {
  try {
    await connectToDatabase();
    const stUser = await isUserExists(id1);
    const ndUser = await isUserExists(id2);
    const [stUserId, ndUserId] = [id1, id2].sort();
    const priorityMap: Record<string, number> = {
      bff: 3,
      friend: 2,
      acquaintance: 1,
    };
    if (stUser && ndUser) {
      const relations = await Relation.find({
        $or: [
          { stUser: stUserId, ndUser: ndUserId },
          { stUser: ndUserId, ndUser: stUserId },
        ],
      });

      if (!relations || relations.length === 0) {
        return null;
      }

      const highestRelation = relations.reduce((prev, current) => {
        const prevPriority = priorityMap[prev.relation] || 0;
        const currentPriority = priorityMap[current.relation] || 0;
        return currentPriority > prevPriority ? current : prev;
      });

      return highestRelation;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
