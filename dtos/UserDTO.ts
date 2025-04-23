import { Schema } from "mongoose";
export interface UserRegisterDTO {
  firstName: string;
  lastName: string;
  nickName: string;
  phoneNumber: string;
  email: string;
  password: string;
  rePassword: string;
  gender: boolean;
  birthDay: Date;
}

export interface UserLoginDTO {
  phoneNumber: string;
  password: string;
}

export interface AuthenticationDTO {
  message: string;
  token: string;
}

export interface MutualFriendDTO {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface SearchUserResponseDTO {
  _id: string;
  avatar: string;
  firstName: string;
  lastName: string;
  mutualFriends: MutualFriendDTO[];
}

export interface UserResponseDTO {
  _id: string;
  firstName: string;
  lastName: string;
  nickName: string;
  phoneNumber: string;
  email: string;
  role: string[];
  avatar: string;
  background: string;
  gender: boolean;
  address: string;
  job: string;
  hobbies: string[];
  bio: string;
  point: number;
  relationShip: string;
  birthDay: string;
  attendDate: string;
  flag: boolean;
  // countReport: number;
  // friendIds: Schema.Types.ObjectId[];
  // followingIds: Schema.Types.ObjectId[];
  // followerIds: Schema.Types.ObjectId[];
  // bestFriendIds: Schema.Types.ObjectId[];
  // blockedIds: Schema.Types.ObjectId[];
  // postIds: Schema.Types.ObjectId[];
  // createAt: Date;
  // createBy: Schema.Types.ObjectId;
  // status: Boolean;
  // saveIds: Schema.Types.ObjectId[];
  // likeIds: Schema.Types.ObjectId[];
}

export interface UpdateUserDTO {
  firstName: string;
  lastName: string;
  nickName: string;
  gender: boolean;
  address: string;
  job: string;
  hobbies: string[];
  relationShip: string;
  birthDay: Date;
}

export interface UserBasicInfo {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface UpdateUserBioDTO {
  bio: string;
}

export interface UpdateAvatarDTO {
  avatar: string;
  avatarPublicId: string;
}

export interface UpdateBackgroundDTO {
  background: string;
  backgroundPublicId: string;
}

export interface PublicUserDTO {
  _id: string;
  firstName: string;
  lastName: string;
  nickName: string;
  gender: boolean;
  address: string;
  job: string;
  hobbies: string[];
  bio: string;
  relationShip: string;
  birthDay: Date;
  relations: string[];
}

export interface FindUserDTO {
  _id: string;
  firstName: string;
  lastName: string;
  nickName: string;
  avatar: string;
  relation: string;
}
