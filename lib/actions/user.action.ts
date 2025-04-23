/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import {
  FindUserDTO,
  UpdateUserDTO,
  UserRegisterDTO,
  UserResponseDTO,
  UpdateUserBioDTO,
  UserBasicInfo,
  SearchUserResponseDTO,
} from "@/dtos/UserDTO";
import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import bcrypt from "bcrypt";
import mongoose, { Schema, Types } from "mongoose";
import Post from "@/database/post.model";
import cloudinary from "@/cloudinary";
import Media from "@/database/media.model";
import { FriendResponseDTO } from "@/dtos/FriendDTO";
import { getMutualFriends } from "./friend.action";
import { MediaResponseDTO } from "@/dtos/MediaDTO";
const saltRounds = 10;

export async function getAllUsers(
  userId: string | undefined
): Promise<SearchUserResponseDTO[]> {
  try {
    connectToDatabase();
    const users = await User.find().select("_id firstName lastName avatar");

    const result: SearchUserResponseDTO[] = await Promise.all(
      users.map(async (friend: any) => {
        // Nếu không có userId, trả về không tính mutualFriends
        if (!userId) {
          return {
            _id: friend._id.toString(),
            firstName: friend.firstName,
            lastName: friend.lastName,
            avatar: friend.avatar,
            mutualFriends: [],
          };
        }

        // Nếu là chính mình thì không cần gọi getMutualFriends
        if (friend._id.toString() === userId) {
          return {
            _id: friend._id.toString(),
            firstName: friend.firstName,
            lastName: friend.lastName,
            avatar: friend.avatar,
            mutualFriends: [],
          };
        }

        const mutualFriends = await getMutualFriends(userId, friend._id);
        return {
          _id: friend._id.toString(),
          firstName: friend.firstName,
          lastName: friend.lastName,
          avatar: friend.avatar,
          mutualFriends: mutualFriends.map((m: any) => ({
            _id: m._id.toString(),
            firstName: m.firstName,
            lastName: m.lastName,
            avatar: m.avatar,
          })),
        };
      })
    );

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const countUsers = async () => {
  try {
    const count = await User.countDocuments();
    return count;
  } catch (error: any) {
    throw new Error("Error counting users: " + error.message);
  }
};

export const countUsersByAttendDate = async () => {
  try {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate).setDate(
      new Date(currentDate).getDate() + 1
    );

    const count = await User.countDocuments({
      attendDate: { $gte: currentDate, $lt: nextDay },
    });

    return count;
  } catch (error: any) {
    throw new Error("Error counting users by attendDate: " + error.message);
  }
};

export async function createUser(
  params: UserRegisterDTO,
  createBy: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();

    const existedUser = await User.findOne({
      $or: [
        { email: params.email, flag: true },
        { phoneNumber: params.phoneNumber, flag: true },
      ],
    });

    if (params.password !== params.rePassword) {
      throw new Error("Your re-password is wrong!");
    }

    if (existedUser) {
      throw new Error("User is already exist!");
    }

    const hashPassword = await bcrypt.hash(params.password, saltRounds);

    const { rePassword, password, ...userData } = params;

    const createUserData = Object.assign({}, userData, {
      password: hashPassword,
      attendDate: new Date(),
      roles: ["user"],
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
      status: false,
    });

    const newUser = await User.create(createUserData);
    const result: UserResponseDTO = {
      _id: newUser._id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      nickName: newUser.nickName,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      background: newUser.background,
      gender: newUser.gender,
      address: newUser.address,
      job: newUser.job,
      hobbies: newUser.hobbies,
      bio: newUser.bio,
      point: newUser.point,
      relationShip: newUser.relationShip,
      birthDay: newUser.birthDay,
      attendDate: newUser.attendDate,
      flag: newUser.flag,
      // countReport: newUser.countReport,
      // friendIds: newUser.friendIds,
      // followingIds: newUser.followingIds,
      // followerIds: newUser.followerIds,
      // bestFriendIds: newUser.bestFriendIds,
      // blockedIds: newUser.blockedIds,
      // postIds: newUser.postIds,
      // createAt: newUser.createAt,
      // createBy: newUser.createBy,
      // status: newUser.status,
      // saveIds: newUser.saveIds,
      // likeIds: newUser.likeIds,
    };

    return result;
  } catch (error) {
    console.log(error);
  }
}

export const changePassword = async (
  userId: Schema.Types.ObjectId | undefined,
  currentPassword: string,
  newPassword: string
) => {
  console.log(userId);
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found!");
  }
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect!");
  }
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  user.password = hashedPassword;
  await user.save();
  return { message: "Password updated successfully" };
};

export async function createAdmin(
  params: UserRegisterDTO,
  createBy: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();

    const existedUser = await User.findOne({
      $or: [{ email: params.email }, { phoneNumber: params.phoneNumber }],
    });

    if (params.password !== params.rePassword) {
      throw new Error("Your re-password is wrong!");
    }

    if (existedUser) {
      throw new Error("User is already exist!");
    }

    const hashPassword = await bcrypt.hash(params.password, saltRounds);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rePassword, password, ...userData } = params;

    const createUserData = Object.assign({}, userData, {
      password: hashPassword,
      attendDate: new Date(),
      roles: ["admin", "user"],
      createBy: createBy ? createBy : "unknown",
    });

    const newUser = await User.create(createUserData);
    const result: UserResponseDTO = {
      _id: newUser._id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      nickName: newUser.nickName,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      background: newUser.background,
      gender: newUser.gender,
      address: newUser.address,
      job: newUser.job,
      hobbies: newUser.hobbies,
      bio: newUser.bio,
      point: newUser.point,
      relationShip: newUser.relationShip,
      birthDay: newUser.birthDay,
      attendDate: newUser.attendDate,
      flag: newUser.flag,
      // countReport: newUser.countReport,
      // friendIds: newUser.friendIds,
      // followingIds: newUser.followingIds,
      // followerIds: newUser.followerIds,
      // bestFriendIds: newUser.bestFriendIds,
      // blockedIds: newUser.blockedIds,
      // postIds: newUser.postIds,
      // createAt: newUser.createAt,
      // createBy: newUser.createBy,
      // status: newUser.status,
      // saveIds: newUser.saveIds,
      // likeIds: newUser.likeIds,
    };

    return result;
  } catch (error) {
    console.log(error);
  }
}

export async function isUserExists(id: string | undefined) {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("Your require user is not exist!");
    }
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function findUser(
  phoneNumber: string | undefined
  // userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();

    const user = await User.findOne({
      phoneNumber: phoneNumber,
    });
    if (!user) {
      throw new Error("Not found");
    }
    const result: FindUserDTO = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      avatar: user.avatar,
      relation: "",
    };
    // const relations = await Relation.find({
    //   stUser: userId,
    //   ndUSer: result._id,
    // });
    // if (relations.length === 0) {
    //   result.relation = "stranger";
    // } else {
    //   for (const relation of relations) {
    //     if (!relation.status) {
    //       if (relation.relation === "bff") {
    //         if (relation.sender.toString() === user._id.toString()) {
    //           result.relation = "sent_bff";
    //           break;
    //         } else {
    //           result.relation = "received_bff";
    //           break;
    //         }
    //       } else {
    //         if (relation.sender.toString() === user._id.toString()) {
    //           result.relation = "sent_friend";
    //         } else {
    //           result.relation = "received_friend";
    //         }
    //       }
    //     } else {
    //       if (relation.relation === "bff") {
    //         result.relation = "bff";
    //         break;
    //       } else {
    //         result.relation = " friend";
    //       }
    //     }
    //   }
    // }
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(
  userId: Schema.Types.ObjectId | undefined,
  params: UpdateUserDTO
) {
  try {
    connectToDatabase();

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw new Error("User not found!");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, params, {
      new: true,
    });

    const result: UserResponseDTO = {
      _id: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      nickName: updatedUser.nickName,
      phoneNumber: updatedUser.phoneNumber,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      background: updatedUser.background,
      gender: updatedUser.gender,
      address: updatedUser.address,
      job: updatedUser.job,
      hobbies: updatedUser.hobbies,
      bio: updatedUser.bio,
      point: updatedUser.point,
      relationShip: updatedUser.relationShip,
      birthDay: updatedUser.birthDay,
      attendDate: updatedUser.attendDate,
      flag: updatedUser.flag,
      // countReport: updatedUser.countReport,
      // friendIds: updatedUser.friendIds,
      // followingIds: updatedUser.followingIds,
      // followerIds: updatedUser.followerIds,
      // bestFriendIds: updatedUser.bestFriendIds,
      // blockedIds: updatedUser.blockedIds,
      // postIds: updatedUser.postIds,
      // createAt: updatedUser.createAt,
      // createBy: updatedUser.createBy,
      // status: updatedUser.status,
      // saveIds: updatedUser.saveIds,
      // likeIds: updatedUser.likeIds,
    };

    return { status: true, newProfile: result };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUserBio(
  userId: Schema.Types.ObjectId | undefined,
  params: UpdateUserBioDTO
) {
  try {
    connectToDatabase();

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw new Error("User not found!");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, params, {
      new: true,
    });

    const result: UserResponseDTO = {
      _id: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      nickName: updatedUser.nickName,
      phoneNumber: updatedUser.phoneNumber,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      background: updatedUser.background,
      gender: updatedUser.gender,
      address: updatedUser.address,
      job: updatedUser.job,
      hobbies: updatedUser.hobbies,
      bio: updatedUser.bio,
      point: updatedUser.point,
      relationShip: updatedUser.relationShip,
      birthDay: updatedUser.birthDay,
      attendDate: updatedUser.attendDate,
      flag: updatedUser.flag,
      // countReport: updatedUser.countReport,
      // friendIds: updatedUser.friendIds,
      // followingIds: updatedUser.followingIds,
      // followerIds: updatedUser.followerIds,
      // bestFriendIds: updatedUser.bestFriendIds,
      // blockedIds: updatedUser.blockedIds,
      // postIds: updatedUser.postIds,
      // createAt: updatedUser.createAt,
      // createBy: updatedUser.createBy,
      // status: updatedUser.status,
      // saveIds: updatedUser.saveIds,
      // likeIds: updatedUser.likeIds,
    };

    return { status: true, newProfile: result };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function disableUser(userId: string) {
  try {
    connectToDatabase();
    const existedUser = await User.findById(userId);

    if (!existedUser) {
      throw new Error(`User ${userId} is not exist`);
    }

    const disableUser = await User.findByIdAndUpdate(userId, { flag: false });

    return disableUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getMyProfile(id: String | undefined) {
  try {
    connectToDatabase();
    const myProfile = await User.findById(id);
    if (!myProfile) {
      console.log(`Cannot get ${id} profile now`);
      throw new Error(`Cannot get ${id} profile now`);
    }
    const result: UserResponseDTO = {
      _id: myProfile._id.toString(),
      firstName: myProfile.firstName,
      lastName: myProfile.lastName,
      nickName: myProfile.nickName,
      phoneNumber: myProfile.phoneNumber,
      email: myProfile.email,
      role: myProfile.role,
      avatar: myProfile.avatar,
      background: myProfile.background,
      gender: myProfile.gender,
      address: myProfile.address,
      job: myProfile.job,
      hobbies: myProfile.hobbies,
      bio: myProfile.bio,
      point: myProfile.point,
      relationShip: myProfile.relationShip,
      birthDay: myProfile.birthDay,
      attendDate: myProfile.attendDate,
      flag: myProfile.flag,
      // countReport: myProfile.countReport,
      // friendIds: myProfile.friendIds,
      // followingIds: myProfile.followingIds,
      // followerIds: myProfile.followerIds,
      // bestFriendIds: myProfile.bestFriendIds,
      // blockedIds: myProfile.blockedIds,
      // postIds: myProfile.postIds,
      // createAt: myProfile.createAt,
      // createBy: myProfile.createBy,
      // status: myProfile.status,
      // saveIds: myProfile.saveIds,
      // likeIds: myProfile.likeIds,
    };

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getMyPosts(id: String | undefined) {
  try {
    connectToDatabase();
    const user = await User.findById(id)
      .populate({
        path: "postIds",
        model: Post,
      })
      .select("postIds");

    if (!user) {
      console.log(`Cannot get ${id} posts now`);
      throw new Error(`Cannot get ${id} posts now`);
    }

    return user.postIds; // Return only the postIds array
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getMyFriends(
  userId: string | undefined
): Promise<FriendResponseDTO[]> {
  try {
    await connectToDatabase();

    const user = await User.findById(userId).select("friendIds");
    if (!user || !Array.isArray(user.friendIds)) {
      console.log(`Cannot get ${userId} friends now`);
      throw new Error(`Cannot get ${userId} friends now`);
    }

    const friends = await User.find(
      { _id: { $in: user.friendIds } },
      "_id firstName lastName avatar"
    ).lean();

    const result: FriendResponseDTO[] = await Promise.all(
      friends.map(async (friend: any) => {
        const mutualFriends = await getMutualFriends(userId, friend._id);

        return {
          _id: friend._id.toString(),
          firstName: friend.firstName,
          lastName: friend.lastName,
          avatar: friend.avatar,
          mutualFriends: mutualFriends.map((m: any) => ({
            _id: m._id.toString(),
            firstName: m.firstName,
            lastName: m.lastName,
            avatar: m.avatar,
          })),
        };
      })
    );

    return result;
  } catch (error) {
    console.error("Error in getMyFriends:", error);
    throw error;
  }
}

export async function getMyBffs(
  userId: string | undefined
): Promise<FriendResponseDTO[]> {
  try {
    connectToDatabase();

    const user = await User.findById(userId).select("bestFriendIds");

    if (!user || !Array.isArray(user.bestFriendIds)) {
      console.log(`Cannot get ${userId} bestFriends now`);
      throw new Error(`Cannot get ${userId} bestFriends now`);
    }
    const bestFriends: UserBasicInfo[] = await User.find(
      {
        _id: { $in: user.bestFriendIds },
      },
      "_id firstName lastName avatar"
    );

    const result: FriendResponseDTO[] = await Promise.all(
      bestFriends.map(async (friend: any) => {
        const mutualFriends = await getMutualFriends(userId, friend._id);

        return {
          _id: friend._id.toString(),
          firstName: friend.firstName,
          lastName: friend.lastName,
          avatar: friend.avatar,
          mutualFriends: mutualFriends.map((m: any) => ({
            _id: m._id.toString(),
            firstName: m.firstName,
            lastName: m.lastName,
            avatar: m.avatar,
          })),
        };
      })
    );

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyFollowings(userId: string | undefined) {
  try {
    connectToDatabase();

    const user = await User.findById(userId).select("followingIds");

    if (!user || !Array.isArray(user.followingIds)) {
      console.log(`Cannot get ${userId} followings now`);
      throw new Error(`Cannot get ${userId} followings now`);
    }

    const followings: UserBasicInfo[] = await User.find(
      {
        _id: { $in: user.followingIds },
      },
      "_id firstName lastName avatar"
    );

    const result: FriendResponseDTO[] = await Promise.all(
      followings.map(async (friend: any) => {
        const mutualFriends = await getMutualFriends(userId, friend._id);

        return {
          _id: friend._id.toString(),
          firstName: friend.firstName,
          lastName: friend.lastName,
          avatar: friend.avatar,
          mutualFriends: mutualFriends.map((m: any) => ({
            _id: m._id.toString(),
            firstName: m.firstName,
            lastName: m.lastName,
            avatar: m.avatar,
          })),
        };
      })
    );

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyFollowers(userId: string | undefined) {
  try {
    connectToDatabase();

    const user = await User.findById(userId).select("followerIds");

    if (!user || !Array.isArray(user.followerIds)) {
      console.log(`Cannot get ${userId} follower now`);
      throw new Error(`Cannot get ${userId} follower now`);
    }

    const followers: UserBasicInfo[] = await User.find(
      {
        _id: { $in: user.followerIds },
      },
      "_id firstName lastName avatar"
    );

    const result: FriendResponseDTO[] = await Promise.all(
      followers.map(async (friend: any) => {
        const mutualFriends = await getMutualFriends(userId, friend._id);

        return {
          _id: friend._id.toString(),
          firstName: friend.firstName,
          lastName: friend.lastName,
          avatar: friend.avatar,
          mutualFriends: mutualFriends.map((m: any) => ({
            _id: m._id.toString(),
            firstName: m.firstName,
            lastName: m.lastName,
            avatar: m.avatar,
          })),
        };
      })
    );

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyBlocks(userId: string | undefined) {
  try {
    connectToDatabase();

    const user = await User.findById(userId).select("blockedIds");

    if (!user || !Array.isArray(user.blockedIds)) {
      console.log(`Cannot get ${userId} blockeds now`);
      throw new Error(`Cannot get ${userId} blockeds now`);
    }

    const blockeds: UserBasicInfo[] = await User.find(
      {
        _id: { $in: user.blockedIds },
      },
      "_id firstName lastName avatar"
    );

    const result: FriendResponseDTO[] = await Promise.all(
      blockeds.map(async (friend: any) => {
        const mutualFriends = await getMutualFriends(userId, friend._id);

        return {
          _id: friend._id.toString(),
          firstName: friend.firstName,
          lastName: friend.lastName,
          avatar: friend.avatar,
          mutualFriends: mutualFriends.map((m: any) => ({
            _id: m._id.toString(),
            firstName: m.firstName,
            lastName: m.lastName,
            avatar: m.avatar,
          })),
        };
      })
    );

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    connectToDatabase();

    // Tìm và xóa người dùng theo ID
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    return {
      status: true,
      message: `User with ID ${userId} has been deleted.`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadAvatar(
  userId: Schema.Types.ObjectId | undefined,
  url: string,
  publicId: string
) {
  try {
    connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not exist");
    }

    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
      console.log("Previous avatar removed from Cloudinary");
    }

    user.avatar = url;
    user.avatarPublicId = publicId;
    await user.save();

    return { message: "Upload avatar successfully" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function uploadBackground(
  userId: Schema.Types.ObjectId | undefined,
  url: string,
  publicId: string
) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not exist");
    }

    if (user.backgroundPublicId) {
      await cloudinary.uploader.destroy(user.backgroundPublicId);
      console.log("Previous background removed from Cloudinary");
    }

    user.background = url;
    user.backgroundPublicId = publicId;

    await user.save();

    return { message: "Upload avatar successfully" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getMyImages(
  id: string | undefined
): Promise<MediaResponseDTO[]> {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    await connectToDatabase();

    const images = await Media.find({
      type: "image",
      createBy: id,
    })
      .select("_id url type caption createAt likes comments shares createBy")
      .lean();

    return images.map((image: any) => ({
      _id: image._id.toString(),
      url: image.url,
      type: image.type,
      caption: image.caption,
      createAt: image.createAt,
      likes: image.likes || [],
      comments: image.comments || [],
      shares: image.shares || [],
      createBy: image.createBy?.toString(),
    }));
  } catch (error) {
    console.error("getMyImages error:", error);
    throw error;
  }
}

export async function getMyVideos(id: String | undefined) {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    connectToDatabase();

    const images = await Media.find({
      type: "video",
      createBy: id,
    }).select("url _id");

    return images;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateStatus(id: string | undefined) {
  try {
    connectToDatabase();

    const existingUser = await User.findById(id);
    if (!existingUser) {
      throw new Error("User not found!");
    }

    const newStatus = !existingUser.status;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    return { status: true, newProfile: updatedUser };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function savePost(
  postId: string,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    await connectToDatabase();

    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Bài viết không tồn tại.");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { saveIds: new Types.ObjectId(postId) } },
      { new: true }
    );

    if (!user) {
      throw new Error("Người dùng không tồn tại.");
    }

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function unsavePost(
  postId: string,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { saveIds: new Types.ObjectId(postId) }, // Xóa bài viết khỏi danh sách
      },
      { new: true }
    );

    if (!user) {
      throw new Error("Người dùng không tồn tại.");
    }

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getMySavedPosts(id: String | undefined) {
  try {
    connectToDatabase();

    const user = await User.findById(id).select("saveIds");

    if (!user || !Array.isArray(user.saveIds)) {
      console.log(`Cannot get ${id} saves now`);
      throw new Error(`Cannot get ${id} saves now`);
    }
    const savedPosts = await Post.find({
      _id: { $in: user.saveIds },
    })
      .populate("author", "firstName lastName _id avatar") // Populate các trường firstName, lastName và _id của author
      .exec();

    return savedPosts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyLikedPosts(id: String | undefined) {
  try {
    connectToDatabase();

    const user = await User.findById(id).select("likeIds");

    if (!user || !Array.isArray(user.likeIds)) {
      console.log(`Cannot get ${id} saves now`);
      throw new Error(`Cannot get ${id} saves now`);
    }
    const likedPosts = await Post.find({
      _id: { $in: user.likeIds },
    })
      .populate("author", "firstName lastName _id avatar") // Populate các trường firstName, lastName và _id của author
      .exec();

    return likedPosts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const findUserByPhoneNumber = async (phoneNumber: string) => {
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return null;
    }
    const result: UserResponseDTO = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      background: user.background,
      gender: user.gender,
      address: user.address,
      job: user.job,
      hobbies: user.hobbies,
      bio: user.bio,
      point: user.point,
      relationShip: user.relationShip,
      birthDay: user.birthDay,
      attendDate: user.attendDate,
      flag: user.flag,
      // countReport: user.countReport,
      // friendIds: user.friendIds,
      // followingIds: user.followingIds,
      // followerIds: user.followerIds,
      // bestFriendIds: user.bestFriendIds,
      // blockedIds: user.blockedIds,
      // postIds: user.postIds,
      // createAt: user.createAt,
      // createBy: user.createBy,
      // status: user.status,
      // saveIds: user.saveIds,
      // likeIds: user.likeIds,
    };

    return result;
  } catch (error: any) {
    throw new Error(`Error finding user by phone number: ${error.message}`);
  }
};

export const forgetPassword = async (
  phoneNumber: string,
  newPassword: string
) => {
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new Error("User with this phone number does not exist.");
  }
  const hashPassword = await bcrypt.hash(newPassword, saltRounds);

  user.password = hashPassword;
  await user.save();

  return { message: "Password updated successfully" };
};
