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
    return { message: `Request friend to ${param.receiver} successfully!` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

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
}

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
      return { message: "you have been blocked them!" };
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
    await unFriend(param);
    return { message: `Block ${param.receiver} successfully!` };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function acceptFriendRequest(param: FriendRequestDTO) {
  try {
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);
    console.log(param.receiver);
    console.log(param.receiver);
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

    await existedFriendRequest.save();
    await stUser.save();
    await ndUser.save();

    return { message: "Accepted" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

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

    stUser.bestFriendIds.addToSet(ndUser._id);
    ndUser.bestFriendIds.addToSet(stUser._id);

    await existedBFFRequest.save();
    await stUser.save();
    await ndUser.save();

    return { message: "Accepted" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function unFriend(param: FriendRequestDTO) {
  try {
    await connectToDatabase();
    const stUser = await isUserExists(param.sender);
    const ndUser = await isUserExists(param.receiver);
    const [stUserId, ndUserId] = [param.sender, param.receiver].sort();
    await Relation.findOneAndDelete({
      stUser: stUserId,
      ndUser: ndUserId,
      relation: "friend",
    });
    await Relation.findOneAndDelete({
      stUser: stUserId,
      ndUser: ndUserId,
      relation: "bff",
    });
    if (stUser && ndUser) {
      stUser.friendIds = stUser.friendIds.filter(
        (id: string) => id.toString() !== ndUser._id.toString()
      );
      stUser.bestFriendIds = stUser.bestFriendIds.filter(
        (id: string) => id.toString() !== ndUser._id.toString()
      );

      ndUser.friendIds = ndUser.friendIds.filter(
        (id: string) => id.toString() !== stUser._id.toString()
      );
      ndUser.bestFriendIds = ndUser.bestFriendIds.filter(
        (id: string) => id.toString() !== stUser._id.toString()
      );
      await stUser.save();
      await ndUser.save();
      return { message: "Unfriend successfully!" };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

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
      stUser.bestFriendIds = stUser.bestFriendIds.filter(
        (id: string) => id.toString() !== ndUser._id.toString()
      );

      ndUser.bestFriendIds = ndUser.bestFriendIds.filter(
        (id: string) => id.toString() !== stUser._id.toString()
      );
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
    stUser.blockedIds = ndUser.blockedIds.filter(
      (id: string) => id.toString() !== ndUser._id.toString()
    );
    await stUser.save();
  } catch (error) {
    console.log(error);
    throw error;
  }
}
