/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import {
  FindUserDTO,
  UpdateUserDTO,
  UserRegisterDTO,
  UserResponseDTO,
  UpdateAvatarDTO,
  UpdateBackgroundDTO,
  UpdateUserBioDTO,
} from "@/dtos/UserDTO";
import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import bcrypt from "bcrypt";
import mongoose, { Schema, Types } from "mongoose";
import { PostResponseDTO } from "@/dtos/PostDTO";
import Post from "@/database/post.model";
import cloudinary from "@/cloudinary";
import Media from "@/database/media.model";
// import Relation from "@/database/relation.model";
const saltRounds = 10;

export async function getAllUsers() {
  try {
    connectToDatabase();
    const result: UserResponseDTO[] = await User.find();

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

    const newUser: UserResponseDTO = await User.create(createUserData);

    return newUser;
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

    const newUser: UserResponseDTO = await User.create(createUserData);

    return newUser;
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

    const updatedUser: UserResponseDTO | null = await User.findByIdAndUpdate(
      userId,
      params,
      {
        new: true,
      }
    );

    return { status: true, newProfile: updatedUser };
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

    const updatedUser: UserResponseDTO | null = await User.findByIdAndUpdate(
      userId,
      params,
      {
        new: true,
      }
    );

    return { status: true, newProfile: updatedUser };
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
    const myProfile: UserResponseDTO | null = await User.findById(id);
    if (!myProfile) {
      console.log(`Cannot get ${id} profile now`);
      throw new Error(`Cannot get ${id} profile now`);
    }
    return myProfile;
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
      .select("postIds"); // Only select the 'postIds' field

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

export async function getMyFriends(id: String | undefined) {
  try {
    connectToDatabase();

    // Tìm user và chỉ lấy friendIds
    const user = await User.findById(id).select("friendIds");

    if (!user || !Array.isArray(user.friendIds)) {
      console.log(`Cannot get ${id} friends now`);
      throw new Error(`Cannot get ${id} friends now`);
    }

    // Truy vấn danh sách bạn bè dựa trên friendIds
    const friends = await User.find({
      _id: { $in: user.friendIds }, // Lấy danh sách bạn bè theo ObjectId
    });

    console.log(friends); // Kiểm tra danh sách bạn bè
    return friends;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyBffs(id: String | undefined) {
  try {
    connectToDatabase();

    const user = await User.findById(id).select("bestFriendIds");

    if (!user || !Array.isArray(user.bestFriendIds)) {
      console.log(`Cannot get ${id} bestFriends now`);
      throw new Error(`Cannot get ${id} bestFriends now`);
    }
    const bestFriends = await User.find({
      _id: { $in: user.bestFriendIds },
    });

    console.log(bestFriends);
    return bestFriends;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyFollowings(id: String | undefined) {
  try {
    connectToDatabase();

    // Tìm user và chỉ lấy friendIds
    const user = await User.findById(id).select("followingIds");

    if (!user || !Array.isArray(user.followingIds)) {
      console.log(`Cannot get ${id} followings now`);
      throw new Error(`Cannot get ${id} followings now`);
    }

    // Truy vấn danh sách bạn bè dựa trên friendIds
    const followings = await User.find({
      _id: { $in: user.followingIds }, // Lấy danh sách bạn bè theo ObjectId
    });

    return followings;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyFollowers(id: String | undefined) {
  try {
    connectToDatabase();

    // Tìm user và chỉ lấy friendIds
    const user = await User.findById(id).select("followerIds");

    if (!user || !Array.isArray(user.followerIds)) {
      console.log(`Cannot get ${id} follower now`);
      throw new Error(`Cannot get ${id} follower now`);
    }

    // Truy vấn danh sách bạn bè dựa trên friendIds
    const follower = await User.find({
      _id: { $in: user.followerIds }, // Lấy danh sách bạn bè theo ObjectId
    });

    return follower;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getMyBlocks(id: String | undefined) {
  try {
    connectToDatabase();

    const user = await User.findById(id).select("blockedIds");

    if (!user || !Array.isArray(user.blockedIds)) {
      console.log(`Cannot get ${id} blockeds now`);
      throw new Error(`Cannot get ${id} blockeds now`);
    }

    const blockeds = await User.find({
      _id: { $in: user.blockedIds },
    });

    console.log(blockeds);
    return blockeds;
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

export async function getMyImages(id: String | undefined) {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    connectToDatabase();

    const images = await Media.find({
      type: "image",
      createBy: id,
    }).select("url _id");

    return images;
  } catch (error) {
    console.error(error);
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
