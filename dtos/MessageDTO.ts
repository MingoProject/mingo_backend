import { Schema } from "mongoose";

export interface ImageContent {
  type: "image";
  url: string;
  altText?: string;
}

export interface LinkContent {
  type: "link";
  url: string;
  title?: string;
}

export interface FileContent {
  type: "file";
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface VideoContent {
  type: "video";
  fileName: string;
  fileUrl: string;
  fileType: string;
  duration: number;
}

export interface VoiceContent {
  type: "voice";
  fileName: string;
  fileUrl: string;
  fileType: string;
  duration: number;
}

export interface IconContent {
  type: "icon";
  name: string;
}

export interface SegmentMessageDTO {
  groupId?: string;
  userId: string;
  userName: string;
  ava: string;
  content:
    | string
    | ImageContent
    | LinkContent
    | FileContent
    | VideoContent
    | IconContent
    | VoiceContent;
  time: Date;
  recipientId: string[];
}

export interface ChatDTO {
  messageBoxId: string;
  messageBox: {
    senderId: string;
    receiverIds: string[];
    messageIds: string[];
    flag: boolean;
    createAt: Date;
    createBy: Schema.Types.ObjectId;
  };
}

export interface Content {
  _id: string;
  content:
    | string
    | ImageContent
    | LinkContent
    | FileContent
    | VideoContent
    | IconContent
    | VoiceContent;
  createAt: Date;
  createBy: Schema.Types.ObjectId;
}

export interface MessageDTO {
  _id: string;
  status: boolean;
  readed_ids: string[];
  contentModel: string;
  createAt: Date;
  createBy: Schema.Types.ObjectId;
}

export interface ResponseSendingDTO {
  populatedMessage: MessageDTO;
  messageBox: ChatDTO;
}
