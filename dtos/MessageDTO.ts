export interface FileContent {
  _id: string;
  fileName: string;
  url: string;
  publicId: string;
  bytes: string;
  width: string;
  height: string;
  format: string;
  type: string;
}

export interface GPSContent {
  _id: string;
  type: "gps";
  latitude: number; // Vĩ độ
  longitude: number; // Kinh độ
  description?: string; // Mô tả địa điểm (tuỳ chọn)
}

export interface RequestSendMessageDTO {
  boxId: string;
  content: string | FileContent;
}

export interface UserInfoBox {
  _id: string;
  firstName: string;
  lastName: string;
  nickName: string;
  avatar: string;
  phone: string;
}

export interface MessageBoxDTO {
  _id: string;
  senderId: string;
  receiverIds: UserInfoBox[];
  messageIds: string[];
  groupName: string;
  groupAva: string[];
  flag: boolean;
  pin: boolean;
  createAt: string;
  createBy: string;
  lastMessage: ResponseMessageDTO | null;
  readStatus: boolean;
}

export interface MessageBoxGroupDTO {
  _id: string;
  senderId: UserInfoBox[];
  receiverIds: UserInfoBox[];
  messageIds: string[];
  groupName: string;
  groupAva: string[];
  flag: boolean;
  pin: boolean;
  createAt: string;
  createBy: string;
  lastMessage: ResponseMessageDTO;
  readStatus: boolean;
}

export interface ResponseMessageBoxDTO {
  box: MessageBoxDTO[];
  adminId: string;
}

export interface ResponseMessageDTO {
  id: string;
  flag: boolean;
  readedId: string[];
  contentId: FileContent[] | GPSContent[];
  text: string[];
  boxId: string;
  createAt: string;
  createBy: string;
  isReact: boolean;
}

export interface DetailMessageBoxDTO {
  _id: string;
  senderId: UserInfoBox;
  receiverIds: UserInfoBox[];
  messageIds: string[];
  groupName: string;
  groupAva: string[];
  flag: boolean;
  pin: boolean;
  createAt: string;
  createBy: string;
  readStatus: boolean;
}

export interface PusherDeleteAndRevoke {
  id: string;
  flag: boolean;
  isReact: boolean;
  contentId: FileContent[] | GPSContent[];
  text: string;
  boxId: string;
  action: string;
}
