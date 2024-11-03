import { Schema } from "mongoose";

export interface FriendRequestDTO {
  sender: string;
  receiver: string;
}

export interface FriendResponseDTO {
  _id: Schema.Types.ObjectId;
  avatar: string;
  firstName: string;
  lastName: string;
  nickName: string;
}

export interface RequestedResponseDTO {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar: string;
  relation: string;
  createAt: string;
}

export interface FriendProfileResponseDTO {
  _id: string;
  firstName: string;
  lastName: string;
  nickName: string;
  phoneNumber: string;
  email: string;
  avatar: string;
  background: string;
  gender: boolean;
  address: string;
  job: string;
  hobbies: string;
  bio: string;
  point: number;
  relationShip: string;
  birthDay: Date;
  attendDate: Date;
  relation: string;
}
