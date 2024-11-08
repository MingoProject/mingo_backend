/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import {
  FindUserDTO,
  UpdateUserDTO,
  UserRegisterDTO,
  UserResponseDTO,
  UpdateAvatarDTO,
  UpdateBackgroundDTO,
} from "@/dtos/UserDTO";
import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
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
    });

    const newUser: UserResponseDTO = await User.create(createUserData);

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

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

export async function findPairUser(id1: string, id2: string) {
  try {
    connectToDatabase();
    const stUser = await User.findById(id1);
    const ndUser = await User.findById(id2);
    if (!stUser || !ndUser) {
      throw new Error("Your require user is not exist!");
    }
    return { stUser, ndUser };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function findUser(
  phoneNumber: string | undefined,
  userId: Schema.Types.ObjectId | undefined
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
    // return result;
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

export async function getMyProfile(id: Schema.Types.ObjectId | undefined) {
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

export async function updateAvatar(
  userId: Schema.Types.ObjectId | undefined,
  params: UpdateAvatarDTO
) {
  try {
    await connectToDatabase();

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw new Error("User not found!");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatar: params.avatar,
        avatarPublicId: params.avatarPublicId,
      },
      { new: true }
    );

    return { status: true, updatedAvatar: updatedUser?.avatar };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateBackground(
  userId: Schema.Types.ObjectId | undefined,
  params: UpdateBackgroundDTO
) {
  try {
    await connectToDatabase();

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw new Error("User not found!");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        background: params.background,
        backgroundPublicId: params.backgroundPublicId,
      },
      { new: true }
    );

    return { status: true, updatedBackground: updatedUser?.background };
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
