import Relation from "@/database/relation.model";
import { FriendRequestDTO } from "@/dtos/FriendDTO";
import { isUserExists } from "./user.action";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { ObjectId } from "mongodb";

export async function requestAddFriend(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const [stUser, ndUser] = [param.sender, param.receiver].sort();
    const existedFriendRelation = await Relation.findOne({
      stUser: stUser,
      ndUser: ndUser,
      relation: "friend",
    });
    await isUserExists(param.sender);
    await isUserExists(param.receiver);
    if (existedFriendRelation) {
      return { message: "Relation is sent!" };
    }
    await Relation.create({
      stUser: stUser,
      ndUser: ndUser,
      relation: "friend",
      sender: param.sender,
      receiver: param.receiver,
      createBy: param.sender,
    });
    await User.updateOne(
      { _id: param.sender },
      { $addToSet: { followingIds: param.receiver } }
    );

    await User.updateOne(
      { _id: param.receiver },
      { $addToSet: { followerIds: param.sender } }
    );

    console.log("ndUser", ndUser);
    return { message: `Request friend to ${param.receiver} successfully!` };
  } catch (error) {
    console.log(error);
    throw error;
  }
} //

export async function acceptFriendRequest(param: FriendRequestDTO) {
  try {
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);
    const existedFriendRequest = await Relation.findOne({
      sender: new ObjectId(param.sender),
      receiver: new ObjectId(param.receiver),
      relation: "friend",
      status: false,
    });
    if (!existedFriendRequest) {
      throw new Error("Cannot find friend relation");
    }
    existedFriendRequest.set("status", true);

    await stUser.friendIds.addToSet(ndUser._id);
    await ndUser.friendIds.addToSet(stUser._id);
    await User.updateOne(
      { _id: param.sender },
      { $pull: { followingIds: param.receiver } }
    );

    await User.updateOne(
      { _id: param.receiver },
      { $pull: { followerIds: param.sender } }
    );

    await existedFriendRequest.save();
    await stUser.save();
    await ndUser.save();

    return { message: "Accepted" };
  } catch (error) {
    console.log(error);
    throw error;
  }
} //p

export async function unfollowUser(param: FriendRequestDTO) {
  try {
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);

    if (!stUser || !ndUser) {
      throw new Error("One or both users do not exist");
    }

    await User.updateOne(
      { _id: param.sender },
      { $pull: { followingIds: param.receiver } }
    );

    await User.updateOne(
      { _id: param.receiver },
      { $pull: { followerIds: param.sender } }
    );

    const deletedRelation = await Relation.findOneAndDelete({
      sender: new ObjectId(param.sender),
      receiver: new ObjectId(param.receiver),
      relation: "friend",
    });

    if (!deletedRelation) {
      console.log("Relation not found or already deleted");
    } else {
      console.log("Relation deleted:", deletedRelation);
    }

    return { message: "Unfollowed successfully and relation deleted" };
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    throw error;
  }
} //p

export async function requestAddBFF(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const [stUser, ndUser] = [param.sender, param.receiver].sort();
    await isUserExists(param.sender);
    await isUserExists(param.receiver);
    const existedBFFRelation = await Relation.findOne({
      stUser: stUser,
      ndUser: ndUser,
      relation: "bff",
    });
    if (existedBFFRelation) {
      return { message: "Relation is sent!" };
    }
    const existedFriendRelation = await Relation.findOne({
      stUser: stUser,
      ndUser: ndUser,
      relation: "friend",
      status: true,
    });
    if (!existedFriendRelation) {
      return { message: "You must be their friend first!" };
    }
    await Relation.create({
      stUser: stUser,
      ndUser: ndUser,
      relation: "bff",
      sender: param.sender,
      receiver: param.receiver,
      createBy: param.sender,
    });
    return { message: `Request bestfriend to ${param.receiver} successfully!` };
  } catch (error) {
    console.log(error);
    throw error;
  }
} //

export async function acceptBFFRequest(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);
    const existedBFFRequest = await Relation.findOne({
      receiver: param.receiver,
      sender: param.sender,
      relation: "bff",
    });
    if (!existedBFFRequest) {
      throw new Error("Cannot find bestfriend relation");
    }
    existedBFFRequest.set("status", true);

    await Relation.findOneAndDelete({
      receiver: param.receiver,
      sender: param.sender,
      relation: "friend",
    });

    stUser.bestFriendIds.addToSet(ndUser._id);
    ndUser.bestFriendIds.addToSet(stUser._id);

    await User.updateOne(
      { _id: param.sender },
      { $pull: { friendIds: param.receiver } }
    );
    await User.updateOne(
      { _id: param.receiver },
      { $pull: { friendIds: param.sender } }
    );

    await existedBFFRequest.save();
    await stUser.save();
    await ndUser.save();

    return { message: "Accepted" };
  } catch (error) {
    console.log(error);
    throw error;
  }
} //

export async function unRequestAddBFF(param: FriendRequestDTO) {
  try {
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);

    if (!stUser || !ndUser) {
      throw new Error("One or both users do not exist");
    }

    const deletedRelation = await Relation.findOneAndDelete({
      sender: new ObjectId(param.sender),
      receiver: new ObjectId(param.receiver),
      relation: "bff",
    });

    if (!deletedRelation) {
      console.log("Relation not found or already deleted");
    } else {
      console.log("Relation deleted:", deletedRelation);
    }

    return { message: "Unfollowed successfully and relation deleted" };
  } catch (error) {
    console.log(error);
    throw error;
  }
} //

export async function unFriend(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const [stUser, ndUser] = [param.sender, param.receiver].sort();
    console.log(stUser);
    const existedFriendRelation = await Relation.findOne({
      stUser: stUser,
      ndUser: ndUser,
      relation: "friend",
    });
    console.log(existedFriendRelation);

    if (!existedFriendRelation) {
      return { message: "You are not friends!" };
    }

    await Relation.deleteOne({ _id: existedFriendRelation._id });
    await User.updateOne(
      { _id: param.sender },
      { $pull: { friendIds: param.receiver } }
    );
    await User.updateOne(
      { _id: param.receiver },
      { $pull: { friendIds: param.sender } }
    );

    await User.updateOne(
      { _id: param.sender },
      { $pull: { bestFriendIds: param.receiver } }
    );
    await User.updateOne(
      { _id: param.receiver },
      { $pull: { bestFriendIds: param.sender } }
    );

    return { message: `Successfully unfriended ${param.receiver}.` };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to unfriend. Please try again.");
  }
} //

export async function block(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const [stUser, ndUser] = [param.sender, param.receiver].sort();
    await isUserExists(param.sender);
    await isUserExists(param.receiver);

    const existedBlockRelation = await Relation.findOne({
      stUser: stUser,
      ndUser: ndUser,
      relation: "block",
      status: true,
    });

    if (existedBlockRelation) {
      return { message: "You have already blocked them!" };
    }

    const bffRelation = await Relation.findOne({
      stUser: stUser,
      ndUser: ndUser,
      relation: "bff",
    });

    if (bffRelation) {
      await unBFF(param);
    }

    const friendRelation = await Relation.findOne({
      stUser: stUser,
      ndUser: ndUser,
      relation: "friend",
    });

    if (friendRelation) {
      await unFriend(param);
    }

    await Relation.create({
      stUser: stUser,
      ndUser: ndUser,
      relation: "block",
      sender: param.sender,
      receiver: param.receiver,
      status: true,
      createBy: param.sender,
    });

    const user = await User.findById(param.sender);
    await user.blockedIds.addToSet(param.receiver);
    await user.save();

    return { message: `Blocked ${param.receiver} successfully!` };
  } catch (error) {
    console.log(error);
    throw error;
  }
} //

export async function unBFF(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);
    const [stUserId, ndUserId] = [param.sender, param.receiver].sort();
    await Relation.findOneAndDelete({
      stUser: stUserId,
      ndUser: ndUserId,
      relation: "bff",
    });
    if (stUser && ndUser) {
      await User.updateOne(
        { _id: param.sender },
        { $pull: { bestFriendIds: param.receiver } }
      );
      await User.updateOne(
        { _id: param.receiver },
        { $pull: { bestFriendIds: param.sender } }
      );
      await Relation.create({
        stUser: stUserId,
        ndUser: ndUserId,
        relation: "friend",
        sender: param.sender,
        receiver: param.receiver,
        createBy: param.sender,
        status: true,
      });
      stUser.friendIds.addToSet(ndUser._id);
      ndUser.friendIds.addToSet(stUser._id);
      await stUser.save();
      await ndUser.save();
      return { message: "Unfriend successfully!" };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function unBlock(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);
    await Relation.findOneAndDelete({
      sender: param.sender,
      receiver: param.receiver,
      relation: "block",
    });
    await User.updateOne(
      { _id: param.sender },
      { $pull: { blockedIds: param.receiver } }
    );
    await stUser.save();
    return { message: "Unblock successfully!" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
