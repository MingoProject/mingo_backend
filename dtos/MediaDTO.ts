import { UserBasicInfo } from "./UserDTO";

export interface MediaCreateDTO {
  url: string;
  type: string;
  caption?: string;
}

export interface MediaResponseDTO {
  _id: string;
  url: string;
  type: string;
  caption?: string;
  createAt: Date;
  likes: string[];
  comments: string[];
  shares: string[];
  createBy?: UserBasicInfo;
}
