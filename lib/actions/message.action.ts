/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"user server";

import Message from "@/database/message.model";
import { connectToDatabase } from "../mongoose";
import {
  FileContent,
  MessageBoxDTO,
  MessageBoxGroupDTO,
  RequestSendMessageDTO,
  DetailMessageBoxDTO,
  ResponseMessageBoxDTO,
  ResponseMessageDTO,
  PusherRevoke,
  PusherDelete,
  StatusResponse,
  ResponseGroupMessageDTO,
} from "@/dtos/MessageDTO";
import mongoose, { Schema, Types } from "mongoose";
import User from "@/database/user.model";
import MessageBox from "@/database/messageBox.model";
import formidable from "formidable";
import cloudinary from "@/cloudinary";
import File from "@/database/file.model";
import { pusherServer } from "../pusher";
import Relation from "@/database/relation.model";

const generateRandomString = (length = 20) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};

async function createFile(file: formidable.File, userId: string) {
  try {
    connectToDatabase();
    console.log(file, "filee create file");

    const mimetype = file.mimetype;
    let result = null;
    let type = "";
    if (mimetype?.startsWith("image/")) {
      // Upload hình ảnh
      result = await cloudinary.uploader.upload(file.filepath, {
        folder: "Avatar",
      });
      type = "Image";
    } else if (mimetype?.startsWith("video/")) {
      // Upload video
      result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: "video",
        folder: "Videos",
      });
      type = "Video";
    } else if (mimetype?.startsWith("audio/")) {
      // Upload âm thanh
      result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: "auto",
        public_id: `Audios/${file.originalFilename}`,
        folder: "Audios",
      });
      type = "Audio";
    } else {
      result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: "raw",
        public_id: `Documents/${file.originalFilename}`,
        folder: "Documents",
      });
      type = "Other";
    }

    const createdFile = await File.create({
      fileName:
        type === "Other" ? file.originalFilename : generateRandomString(),
      url: result.url,
      publicId: result.public_id,
      bytes: result.bytes,
      width: result.width || "0",
      height: result.height || "0",
      format: result.type || "unknown",
      type: type,
      createBy: new Types.ObjectId(userId),
    });
    return createdFile;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function createContent(
  data: RequestSendMessageDTO,
  files: formidable.Files,
  userId: string,
  membersIds: string[]
) {
  let contentIds: mongoose.Types.ObjectId[] = [];
  const userObjectId = new Types.ObjectId(userId);
  let text: string[] = [];

  if (typeof data.content === "string") {
    text = [data.content];
  } else if (
    data.content &&
    data.content.fileName &&
    data.content.format &&
    data.content.type
  ) {
    if (files.file) {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const createdFile = await createFile(file, userId);
      contentIds = [createdFile._id];
      text = [];
    } else {
      throw new Error("No file provided");
    }
  } else {
    throw new Error("Invalid content type");
  }

  const visibilityMap = new Map();
  membersIds.forEach((member) => {
    visibilityMap.set(member.toString(), true); // Gán true cho tất cả userId
  });
  // Tạo tin nhắn
  const message = await Message.create({
    flag: true,
    visibility: visibilityMap,
    readedId: [userId],
    contentId: contentIds,
    text: text,
    boxId: new Types.ObjectId(data.boxId),
    createAt: Date.now(),
    updatedAt: Date.now(),
    createBy: userObjectId,
  });

  return message;
}

// export async function createMessage(
//   data: RequestSendMessageDTO,
//   files: formidable.Files,
//   userId: string
// ) {
//   try {
//     await connectToDatabase();
//     const userObjectId = new Types.ObjectId(userId);

//     // eslint-disable-next-line prefer-const
//     let detailBox = await MessageBox.findById(data.boxId);
//     if (detailBox) {
//       const receiverIdsArray = detailBox.receiverIds;

//       if (receiverIdsArray.length > 2) {
//         const membersIds: string[] = [
//           ...receiverIdsArray.map((id: { toString: () => any }) =>
//             id.toString()
//           ),
//           detailBox.senderId.toString(),
//         ];
//         const leaderExists = membersIds.includes(userId);
//         if (!leaderExists) {
//           throw new Error("UserId must be in MembersId list");
//         }

//         const message = await createContent(data, files, userId, membersIds);
//         const populatedMessage = await Message.findById(message._id).populate({
//           path: "contentId",
//           model: "File",
//           select: "",
//           options: { strictPopulate: false },
//         });

//         detailBox = await MessageBox.findByIdAndUpdate(
//           data.boxId,
//           {
//             $push: { messageIds: message._id },
//             $set: { senderId: userId },
//           },
//           { new: true }
//         );
//         if (!detailBox) {
//           throw new Error("Group MessageBox cannot update");
//         }

//         const pusherMessage: ResponseGroupMessageDTO = {
//           id: populatedMessage._id.toString(),
//           flag: true,
//           isReact: false,
//           readedId: populatedMessage.readedId.map((id: any) => id.toString()),
//           contentId:
//             populatedMessage.contentId[populatedMessage.contentId.length - 1],
//           text: populatedMessage.text[populatedMessage.text.length - 1],
//           boxId: data.boxId,
//           // Chuyển ObjectId sang chuỗi
//           createAt: new Date().toISOString(), // ISO string đã hợp lệ
//           createBy: populatedMessage.createBy._id,
//         };

//         await pusherServer
//           .trigger(`private-${data.boxId}`, "new-message", pusherMessage)
//           .then(() => console.log("Message sent successfully: ", pusherMessage))
//           .catch((error) => console.error("Failed to send message:", error));
//         //return { success: true, populatedMessage, detailBox };
//         return { success: true, message: "Send successfully" };
//       } else {
//         const [stUserId, ndUserId] = [receiverIdsArray[0], userId].sort();
//         const relationBlock = await Relation.findOne({
//           stUser: stUserId,
//           ndUser: ndUserId,
//           relation: "block",
//         });
//         if (relationBlock) {
//           throw new Error("Sender is blocked by Receiver");
//         }
//         const membersIds: string[] = [
//           ...receiverIdsArray.map((id: { toString: () => any }) =>
//             id.toString()
//           ),
//           detailBox.senderId.toString(),
//         ];
//         const message = await createContent(data, files, userId, membersIds);
//         detailBox = await MessageBox.findByIdAndUpdate(
//           detailBox._id,
//           {
//             $push: { messageIds: message._id },
//             $set: { senderId: userId },
//             $addToSet: { receiverIds: userId },
//           },
//           { new: true }
//         );
//         const populatedMessage = await Message.findById(message._id).populate({
//           path: "contentId",
//           model: "File",
//           select: "",
//           options: { strictPopulate: false },
//         });

//         const pusherMessage: ResponseGroupMessageDTO = {
//           id: populatedMessage._id.toString(),
//           flag: true,
//           isReact: false,
//           readedId: populatedMessage.readedId.map((id: any) => id.toString()),
//           contentId:
//             populatedMessage.contentId[populatedMessage.contentId.length - 1],
//           text: populatedMessage.text[populatedMessage.text.length - 1],
//           boxId: data.boxId,
//           // Chuyển ObjectId sang chuỗi
//           createAt: new Date().toISOString(), // ISO string đã hợp lệ
//           createBy: populatedMessage.createBy._id,
//         };

//         await pusherServer
//           .trigger(`private-${data.boxId}`, "new-message", pusherMessage)
//           .then(() => console.log("Message sent successfully: ", pusherMessage))
//           .catch((error) => console.error("Failed to send message:", error));

//         // return { success: true, populatedMessage, detailBox };
//         return { success: true, message: "Send successfully" };
//       }
//     } else {
//       const message = await createContent(data, files, userId, [
//         userId,
//         data.boxId,
//       ]);
//       const populatedMessage = await Message.findById(message._id).populate({
//         path: "contentId",
//         model: "File",
//         select: "",
//         options: { strictPopulate: false },
//       });
//       detailBox = await MessageBox.create({
//         senderId: userId,
//         receiverIds: [data.boxId, userId],
//         messageIds: [message._id],
//         groupName: "",
//         groupAva: "",
//         flag: true,
//         pin: false,
//         createBy: userObjectId,
//         status: true,
//       });
//       const pusherMessage: ResponseGroupMessageDTO = {
//         id: populatedMessage._id.toString(),
//         flag: true,
//         isReact: false,
//         readedId: populatedMessage.readedId.map((id: any) => id.toString()),
//         contentId:
//           populatedMessage.contentId[populatedMessage.contentId.length - 1],
//         text: populatedMessage.text[populatedMessage.text.length - 1],
//         boxId: data.boxId,
//         // Chuyển ObjectId sang chuỗi
//         createAt: new Date().toISOString(), // ISO string đã hợp lệ
//         createBy: populatedMessage.createBy._id,
//       };

//       await pusherServer
//         .trigger(`private-${userId}`, "new-message", pusherMessage)
//         .then(() => console.log("Message sent successfully: ", pusherMessage))
//         .catch((error) => console.error("Failed to send message:", error));
//       return { success: true, message: "Create new box and send successfully" };
//     }
//   } catch (error) {
//     console.error("Error sending message: ", error);
//     throw error;
//   }
// }

export async function createBoxChat(
  membersIds: string[],
  leaderId: string,
  groupName: string,
  groupAva: string
) {
  if (!Array.isArray(membersIds) || membersIds.length === 0) {
    throw new Error("membersIds must be a non-empty array");
  }

  // Kiểm tra leader có tồn tại
  const leaderExist = await User.exists({ _id: leaderId });
  if (!leaderExist) {
    throw new Error("Leader ID does not exist");
  }

  // Kiểm tra tất cả các thành viên có tồn tại
  const allMembersExist = await User.countDocuments({
    _id: { $in: membersIds },
  });
  if (allMembersExist !== membersIds.length) {
    throw new Error("One or more member IDs do not exist");
  }

  // Kiểm tra sự tồn tại của nhóm với các thành viên trùng lặp
  const existMessageBox = await MessageBox.findOne({
    $and: [
      { receiverIds: { $all: membersIds } }, // Bao gồm tất cả các thành viên
      { receiverIds: { $size: membersIds.length } }, // Đảm bảo số lượng thành viên khớp
    ],
  });

  if (existMessageBox) {
    throw new Error("A group with the same members already exists");
  }

  // Tạo ObjectId cho leader
  const userObjectId = new Types.ObjectId(leaderId);

  // Tạo nhóm mới
  const messageBox = await MessageBox.create({
    senderId: leaderId,
    receiverIds: membersIds,
    messageIds: [],
    groupName: groupName,
    groupAva: groupAva,
    flag: true,
    pin: false,
    createBy: userObjectId,
    status: true,
  });

  return {
    success: true,
    message: "Create group successfully",
    messageBoxId: messageBox._id,
  };
}

export async function createMessage(
  data: RequestSendMessageDTO,
  files: formidable.Files,
  userId: string
) {
  try {
    await connectToDatabase();
    const userObjectId = new Types.ObjectId(userId);

    let detailBox = await MessageBox.findById(data.boxId);
    if (detailBox) {
      const receiverIdsArray = detailBox.receiverIds;

      if (receiverIdsArray.length > 2) {
        const membersIds: string[] = [
          ...receiverIdsArray.map((id: { toString: () => any }) =>
            id.toString()
          ),
          detailBox.senderId.toString(),
        ];
        const leaderExists = membersIds.includes(userId);
        if (!leaderExists) {
          throw new Error("UserId must be in MembersId list");
        }

        const message = await createContent(data, files, userId, membersIds);
        const populatedMessage = await Message.findById(message._id).populate({
          path: "contentId",
          model: "File",
          select: "",
          options: { strictPopulate: false },
        });

        // Populate thông tin người tạo tin nhắn (createBy)
        const populatedSender = await populatedMessage.populate({
          path: "createBy",
          model: "User",
          select: "firstName lastName avatar",
        });

        detailBox = await MessageBox.findByIdAndUpdate(
          data.boxId,
          {
            $push: { messageIds: message._id },
            $set: { senderId: userId },
          },
          { new: true }
        );
        if (!detailBox) {
          throw new Error("Group MessageBox cannot update");
        }

        const pusherMessage: ResponseGroupMessageDTO = {
          id: populatedMessage._id.toString(),
          flag: true,
          isReact: false,
          readedId: populatedMessage.readedId.map((id: any) => id.toString()),
          contentId:
            populatedMessage.contentId[populatedMessage.contentId.length - 1],
          text: populatedMessage.text[populatedMessage.text.length - 1],
          boxId: data.boxId,
          createAt: new Date().toISOString(),
          createBy: populatedMessage.createBy._id,
          createName: populatedSender.createBy
            ? `${populatedSender.createBy.firstName} ${populatedSender.createBy.lastName}`
            : "Unknown",
          createAvatar: populatedSender.createBy
            ? populatedSender.createBy.avatar
            : "",
        };

        await pusherServer
          .trigger(`private-${data.boxId}`, "new-message", pusherMessage)
          .then(() => console.log("Message sent successfully: ", pusherMessage))
          .catch((error) => console.error("Failed to send message:", error));

        return { success: true, message: "Send successfully" };
      } else {
        const [stUserId, ndUserId] = [receiverIdsArray[0], userId].sort();
        const relationBlock = await Relation.findOne({
          stUser: stUserId,
          ndUser: ndUserId,
          relation: "block",
        });
        if (relationBlock) {
          throw new Error("Sender is blocked by Receiver");
        }
        const membersIds: string[] = [
          ...receiverIdsArray.map((id: { toString: () => any }) =>
            id.toString()
          ),
          detailBox.senderId.toString(),
        ];
        const message = await createContent(data, files, userId, membersIds);
        detailBox = await MessageBox.findByIdAndUpdate(
          detailBox._id,
          {
            $push: { messageIds: message._id },
            $set: { senderId: userId },
            $addToSet: { receiverIds: userId },
          },
          { new: true }
        );
        const populatedMessage = await Message.findById(message._id).populate({
          path: "contentId",
          model: "File",
          select: "",
          options: { strictPopulate: false },
        });

        // Populate thông tin người tạo tin nhắn (createBy)
        const populatedSender = await populatedMessage.populate({
          path: "createBy",
          model: "User",
          select: "firstName lastName avatar",
        });

        const pusherMessage: ResponseGroupMessageDTO = {
          id: populatedMessage._id.toString(),
          flag: true,
          isReact: false,
          readedId: populatedMessage.readedId.map((id: any) => id.toString()),
          contentId:
            populatedMessage.contentId[populatedMessage.contentId.length - 1],
          text: populatedMessage.text[populatedMessage.text.length - 1],
          boxId: data.boxId,
          createAt: new Date().toISOString(),
          createBy: populatedMessage.createBy._id,
          createName: populatedSender.createBy
            ? `${populatedSender.createBy.firstName} ${populatedSender.createBy.lastName}`
            : "Unknown",
          createAvatar: populatedSender.createBy
            ? populatedSender.createBy.avatar
            : "",
        };

        await pusherServer
          .trigger(`private-${data.boxId}`, "new-message", pusherMessage)
          .then(() => console.log("Message sent successfully: ", pusherMessage))
          .catch((error) => console.error("Failed to send message:", error));

        return { success: true, message: "Send successfully" };
      }
    } else {
      // Nếu không tìm thấy MessageBox thì tạo mới
      const message = await createContent(data, files, userId, [
        userId,
        data.boxId,
      ]);
      const populatedMessage = await Message.findById(message._id).populate({
        path: "contentId",
        model: "File",
        select: "",
        options: { strictPopulate: false },
      });
      detailBox = await MessageBox.create({
        senderId: userId,
        receiverIds: [data.boxId, userId],
        messageIds: [message._id],
        groupName: "",
        groupAva: "",
        flag: true,
        pin: false,
        createBy: userObjectId,
        status: true,
      });

      // Populate thông tin người tạo tin nhắn (createBy)
      const populatedSender = await populatedMessage.populate({
        path: "createBy",
        model: "User",
        select: "firstName lastName avatar",
      });

      const pusherMessage: ResponseGroupMessageDTO = {
        id: populatedMessage._id.toString(),
        flag: true,
        isReact: false,
        readedId: populatedMessage.readedId.map((id: any) => id.toString()),
        contentId:
          populatedMessage.contentId[populatedMessage.contentId.length - 1],
        text: populatedMessage.text[populatedMessage.text.length - 1],
        boxId: data.boxId,
        createAt: new Date().toISOString(),
        createBy: populatedMessage.createBy._id,
        createName: populatedSender.createBy
          ? `${populatedSender.createBy.firstName} ${populatedSender.createBy.lastName}`
          : "Unknown",
        createAvatar: populatedSender.createBy
          ? populatedSender.createBy.avatar
          : "",
      };

      await pusherServer
        .trigger(`private-${userId}`, "new-message", pusherMessage)
        .then(() => console.log("Message sent successfully: ", pusherMessage))
        .catch((error) => console.error("Failed to send message:", error));

      return { success: true, message: "Create new box and send successfully" };
    }
  } catch (error) {
    console.error("Error sending message: ", error);
    throw error;
  }
}

export async function createGroup(
  membersIds: string[],
  leaderId: string,
  groupName: string,
  groupAva: string
) {
  if (!Array.isArray(membersIds) || membersIds.length === 0) {
    throw new Error("membersIds must be a non-empty array");
  }
  const leaderExist = await User.exists({ _id: leaderId });
  if (!leaderExist) {
    throw new Error("Leader ID does not exist");
  }
  const allMembersExist = await User.exists({ _id: { $in: membersIds } });
  if (!allMembersExist) {
    throw new Error("One or more member IDs do not exist");
  }
  const allReceiverIds = [leaderId, ...membersIds];
  const existMessageBox = await MessageBox.findOne({
    receiverIds: { $size: allReceiverIds.length, $all: allReceiverIds },
  });

  if (existMessageBox) {
    return {
      success: false,
      message: "Box is existed.",
      existMessageBox,
    };
  }

  const userObjectId = new Types.ObjectId(leaderId);
  const messageBox: MessageBoxDTO = await MessageBox.create({
    senderId: leaderId,
    receiverIds: [leaderId, ...membersIds],
    messageIds: [],
    groupName: groupName,
    groupAva: groupAva,
    flag: true,
    pin: false,
    createBy: userObjectId,
  });
  // return { success: true, messageBoxId: messageBox._id, messageBox };
  return {
    success: true,
    message: "Create box chat successfully",
    newBox: messageBox,
  };
}

export async function recieveMessage(messageId: string) {
  try {
    await connectToDatabase();
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    return { success: true, message };
  } catch (error) {
    console.error("Error recieving message: ", error);
    throw error;
  }
}

export async function editMessage(
  messageId: string,
  newContent: string,
  userId: string
) {
  try {
    await connectToDatabase();

    const message = await Message.findOne({
      _id: messageId,
      [`visibility.${userId}`]: true,
      flag: true,
    });

    if (!message) {
      throw new Error("Message not found");
    }
    if (message.createBy.toString() === userId) {
      if (message.text !== "" && message.contentId.length === 0) {
        message.text.push(newContent);
        message.updatedAt = new Date();
        await message.save();
        const updatedMessage = await Message.findById(message._id).populate(
          "contentId"
        );
        const editedMessage: ResponseMessageDTO = {
          id: updatedMessage._id.toString(),
          flag: true,
          isReact: false,
          readedId: updatedMessage.readedId.map((id: any) => id.toString()),
          contentId:
            updatedMessage.contentId[updatedMessage.contentId.length - 1],
          text: newContent,
          boxId: updatedMessage.boxId.toString(),
          // Chuyển ObjectId sang chuỗi
          createAt: updatedMessage.createAt,
          createBy: updatedMessage.createBy.toString(),
        };
        return { success: true, editedMessage };
      } else {
        throw new Error("Only text can be edited");
      }
    } else {
      throw new Error("Unauthorized to edit this message");
    }
  } catch (error) {
    console.error("Error editing message: ", error);
    throw error;
  }
}

export async function deleteOrRevokeMessage(
  messageId: string,
  userId: string,
  action: "revoke" | "delete" | "unsend"
) {
  try {
    await connectToDatabase();
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message is not found");
    }
    if (!message.readedId.includes(userId)) {
      throw new Error("Unauthorized to delete or recall this message");
    }

    if (action === "revoke") {
      message.flag = false;

      await message.save();
      const pusherMessage: PusherRevoke = {
        id: message._id.toString(),
        flag: message.flag,
        isReact: message.isReact,
        text: "Message revoked",
        boxId: message.boxId.toString(),
        action: "revoke",
        createAt: new Date().toISOString(),
        createBy: userId,
      };

      await pusherServer
        .trigger(`private-${message.boxId}`, "revoke-message", pusherMessage)
        .then(() =>
          console.log("Message revoked successfully: ", pusherMessage)
        )
        .catch((error) => console.error("Failed to revoke message:", error));
      return { success: true, message: "Message revoked" };
    } else if (action == "delete") {
      message.visibility.set(userId, false);
      await message.save();
      console.log(message, "delete message");
      const pusherMessage: PusherDelete = {
        id: message._id.toString(),
        flag: message.flag,
        visibility: false,
        isReact: message.isReact,
        text: "Message deleted",
        boxId: message.boxId.toString(),
        action: "delete",
        createAt: new Date().toISOString(),
        createBy: userId,
      };

      await pusherServer
        .trigger(`private-${message.boxId}`, "delete-message", pusherMessage)
        .then(() =>
          console.log("Message deleted successfully: ", pusherMessage)
        )
        .catch((error) => console.error("Failed to delete message:", error));
      return { success: true, message: "Message deleted" };
    } else if (action == "unsend") {
      if (Array.isArray(message.readedId)) {
        message.readedId.forEach((receiverId: any) => {
          message.visibility.set(receiverId.toString(), false); // Đảm bảo receiverId là chuỗi
        });
      } else {
        throw new Error("Receivers list is invalid");
      }
      await message.save();
      const pusherMessage: PusherDelete = {
        id: message._id.toString(),
        flag: false,
        visibility: false,
        isReact: message.isReact,
        text: "Message unsend",
        boxId: message.boxId.toString(),
        action: "unsend",
        createAt: new Date().toISOString(),
        createBy: userId,
      };

      await pusherServer
        .trigger(`private-${message.boxId}`, "unsend-message", pusherMessage)
        .then(() => console.log("Message unsend successfully: ", pusherMessage))
        .catch((error) => console.error("Failed to unsend message:", error));
      return { success: true, message: "Message unsend" };
    } else {
      throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Error deleting or recalling message: ", error);
    throw error;
  }
}

export async function fetchMessage(boxId: string, userId: string) {
  try {
    await connectToDatabase();

    // Tìm kiếm MessageBox và populate các messageIds
    const messageBox = await MessageBox.findById(boxId).populate("messageIds");

    if (!messageBox) {
      throw new Error("MessageBox not found");
    }

    // Lọc các tin nhắn có visibility là true đối với userId
    const messagesWithContent: ResponseMessageDTO[] = await Promise.all(
      messageBox.messageIds.map(async (messageId: any) => {
        // Tìm tin nhắn với messageId và kiểm tra visibility của userId
        const message = await Message.findOne({
          _id: messageId,
          [`visibility.${userId}`]: true, // Kiểm tra visibility của userId
        });

        if (!message) {
          // Nếu không tìm thấy tin nhắn có visibility đúng, bỏ qua
          return null;
        }

        // Populate nội dung của tin nhắn
        const populatedMessage = await message.populate({
          path: "contentId",
          model: "File",
          select: "",
          options: { strictPopulate: false },
        });

        // Tạo DTO cho tin nhắn với nội dung đã populate
        const responseMessage: ResponseMessageDTO = {
          id: populatedMessage._id,
          flag: populatedMessage.flag,
          isReact: populatedMessage.isReact,
          readedId: populatedMessage.readedId,
          contentId: populatedMessage.flag
            ? populatedMessage.contentId[populatedMessage.contentId.length - 1]
            : undefined,
          text: populatedMessage.flag
            ? populatedMessage.text[populatedMessage.text.length - 1]
            : "Message revoked", // Nếu tin nhắn bị thu hồi
          boxId: populatedMessage.boxId.toString(),
          createAt: populatedMessage.createAt,
          createBy: populatedMessage.createBy,
        };

        return responseMessage;
      })
    );

    // Lọc bỏ các tin nhắn không hợp lệ (null)
    const validMessages = messagesWithContent.filter(Boolean);

    return { success: true, messages: validMessages };
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw error;
  }
}

export async function fetchGroupMessage(boxId: string, userId: string) {
  try {
    await connectToDatabase();

    // Tìm kiếm MessageBox và populate các messageIds
    const messageBox = await MessageBox.findById(boxId)
      .populate("messageIds")
      .populate("receiverIds", "firstName lastName avatar");

    if (!messageBox) {
      throw new Error("MessageBox not found");
    }

    // Lọc các tin nhắn có visibility là true đối với userId
    const messagesWithContent: ResponseGroupMessageDTO[] = await Promise.all(
      messageBox.messageIds.map(async (messageId: any) => {
        // Tìm tin nhắn với messageId và kiểm tra visibility của userId
        const message = await Message.findOne({
          _id: messageId,
          [`visibility.${userId}`]: true, // Kiểm tra visibility của userId
        });

        if (!message) {
          // Nếu không tìm thấy tin nhắn có visibility đúng, bỏ qua
          return null;
        }

        // Populate nội dung của tin nhắn
        const populatedMessage = await message.populate({
          path: "contentId",
          model: "File",
          select: "",
          options: { strictPopulate: false },
        });

        // Populate thông tin người tạo tin nhắn
        const populatedSender = await message.populate({
          path: "createBy",
          model: "User",
          select: "firstName lastName avatar", // Lấy thông tin firstName, lastName, avatar
        });

        // Tạo DTO cho tin nhắn với nội dung đã populate
        const responseMessage: ResponseGroupMessageDTO = {
          id: populatedMessage._id,
          flag: populatedMessage.flag,
          isReact: populatedMessage.isReact,
          readedId: populatedMessage.readedId,
          contentId: populatedMessage.flag
            ? populatedMessage.contentId[populatedMessage.contentId.length - 1]
            : undefined,
          text: populatedMessage.flag
            ? populatedMessage.text[populatedMessage.text.length - 1]
            : "Message revoked", // Nếu tin nhắn bị thu hồi
          boxId: populatedMessage.boxId.toString(),
          createAt: populatedMessage.createAt,
          createBy: populatedMessage.createBy._id,
          createName: populatedSender.createBy
            ? `${populatedSender.createBy.firstName} ${populatedSender.createBy.lastName}`
            : "Unknown", // Tên đầy đủ của người tạo
          createAvatar: populatedSender.createBy
            ? populatedSender.createBy.avatar
            : "", // Avatar của người tạo tin nhắn
        };

        return responseMessage;
      })
    );

    // Lọc bỏ các tin nhắn không hợp lệ (null)
    const validMessages = messagesWithContent.filter(Boolean);

    return { success: true, messages: validMessages };
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw error;
  }
}

export async function checkMarkMessageAsRead(boxIds: string[], userId: string) {
  try {
    // Kết nối cơ sở dữ liệu
    await connectToDatabase();

    // Kiểm tra nếu user tồn tại
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new Error("User does not exist");
    }

    // Kiểm tra trạng thái từng `boxId`
    const results = await Promise.all(
      boxIds.map(async (boxId) => {
        try {
          // Tìm MessageBox theo `boxId`
          const messageBox = await MessageBox.findById(boxId).populate(
            "messageIds"
          );

          if (!messageBox) {
            return { boxId, success: false, message: "Box not found" };
          }

          if (messageBox.messageIds.length === 0) {
            return { boxId, success: false, message: "No messages in the box" };
          }

          // Lấy tin nhắn cuối cùng trong box
          const lastMessage =
            messageBox.messageIds[messageBox.messageIds.length - 1];

          // Kiểm tra xem người dùng đã đọc tin nhắn cuối cùng chưa
          if (lastMessage.readedId.includes(userId)) {
            return { boxId, success: true, message: "Message already read" };
          } else {
            return { boxId, success: false, message: "Message not read yet" };
          }
        } catch (error) {
          console.error(`Error processing box ${boxId}:`, error);
          return { boxId, success: false, message: "Error processing box" };
        }
      })
    );
    console.log(results);
    return results;
  } catch (error) {
    console.error("Error checking message read status: ", error);
    throw error;
  }
}

export async function markMessageAsRead(boxId: string, userId: string) {
  try {
    await connectToDatabase();

    const messageBox = await MessageBox.findById(boxId).populate("messageIds");
    if (!messageBox) {
      throw new Error("Box not found");
    }
    if (messageBox.messageIds.length === 0) {
      return null;
    }

    // Kiểm tra nếu user tồn tại
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new Error("User does not exist");
    }

    const lastMessage = messageBox.messageIds[messageBox.messageIds.length - 1];

    // Kiểm tra nếu user chưa đọc message cuối cùng
    if (!lastMessage.readedId.includes(userId)) {
      // Cập nhật tất cả message trong box với userId
      await Promise.all(
        messageBox.messageIds.map(async (messageId: any) => {
          const message = await Message.findById(messageId);
          if (message && !message.readedId.includes(userId)) {
            message.readedId.push(userId);
            await message.save();
          }
        })
      );

      console.log(lastMessage, "this is last message");

      return {
        success: true,
        messages: "Messages marked as read",
      };
    } else {
      return {
        success: true,
        messages: "Messages already read",
        lastMessage,
      };
    }
  } catch (error) {
    console.error("Error marking message as read: ", error);
    throw error;
  }
}

export async function uploadGroupAvatar(
  boxId: string,
  url: string,
  publicId: string
) {
  try {
    connectToDatabase();
    const group = await MessageBox.findById(boxId);
    if (!group) {
      throw new Error("BoxId not exist");
    }

    if (group.groupAvaPublicId) {
      await cloudinary.uploader.destroy(group.groupAvaPublicId);
      console.log("Previous avatar removed from Cloudinary");
    }

    group.groupAva = url;
    group.groupAvaPublicId = publicId;
    await group.save();

    return { message: "Upload avatar successfully" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// export async function fetchBoxChat(userId: string) {
//   try {
//     await connectToDatabase();

//     const messageBoxes = await MessageBox.find({
//       $and: [{ receiverIds: { $in: [userId] } }, { receiverIds: { $size: 2 } }],
//     }).populate(
//       "receiverIds",
//       "firstName lastName nickName avatar phoneNumber"
//     );

//     if (!messageBoxes.length) {
//       return {
//         success: false,
//         box: "No message boxes found for this userId",
//       };
//     }

//     // Xử lý từng box để lấy tin nhắn cuối và kiểm tra trạng thái đọc
//     const messageBoxesWithDetails: MessageBoxDTO[] = await Promise.all(
//       messageBoxes.map(async (messageBox) => {
//         // Lọc những messageIds có visibility của userId là true
//         const filteredMessageIds = await Promise.all(
//           messageBox.messageIds.map(async (messageId: any) => {
//             const message = await Message.findById(messageId).select(
//               "visibility"
//             );
//             return message?.visibility?.get(userId) === true ? messageId : null;
//           })
//         );

//         // Lọc bỏ các null values trong mảng
//         const validMessageIds = filteredMessageIds.filter((id) => id !== null);

//         // Lấy tin nhắn cuối cùng từ danh sách hợp lệ
//         const lastMessageId = validMessageIds[validMessageIds.length - 1];

//         if (!lastMessageId) {
//           return {
//             ...messageBox.toObject(),
//             lastMessage: null,
//             readStatus: false,
//           };
//         }

//         // Lấy thông tin tin nhắn cuối
//         const lastMessage = await Message.findById(lastMessageId).populate({
//           path: "contentId",
//           model: "File",
//           options: { strictPopulate: false },
//         });

//         if (!lastMessage) {
//           return {
//             ...messageBox.toObject(),
//             lastMessage: null,
//             readStatus: false,
//           };
//         }

//         // Kiểm tra trạng thái đã đọc
//         const isRead = lastMessage.readedId.includes(userId);
//         const readStatus = isRead ? true : false;

//         const responseLastMessage: ResponseMessageDTO = {
//           id: lastMessage._id,
//           flag: lastMessage.flag,
//           isReact: lastMessage.isReact,
//           readedId: lastMessage.readedId,
//           contentId: lastMessage.flag
//             ? lastMessage.contentId[lastMessage.contentId.length - 1]
//             : undefined,
//           text: lastMessage.flag
//             ? lastMessage.text[lastMessage.text.length - 1]
//             : "Message revoked",
//           boxId: lastMessage.boxId.toString(),
//           createAt: lastMessage.createAt,
//           createBy: lastMessage.createBy,
//         };

//         return {
//           ...messageBox.toObject(),
//           responseLastMessage,
//           readStatus,
//         };
//       })
//     );

//     return {
//       success: true,
//       box: messageBoxesWithDetails,
//       adminId: userId,
//     };
//   } catch (error) {
//     console.error("Error fetching messages: ", error);
//     throw error;
//   }
// }

export async function fetchBoxChat(userId: string) {
  try {
    await connectToDatabase();

    const messageBoxes = await MessageBox.find({
      $and: [{ receiverIds: { $in: [userId] } }, { receiverIds: { $size: 2 } }],
    }).populate(
      "receiverIds",
      "firstName lastName nickName avatar phoneNumber status"
    );

    if (!messageBoxes.length) {
      return {
        success: true,
        box: [],
      };
    }

    //Process each message box and retrieve the last message
    const messageBoxesWithDetails: MessageBoxDTO[] = await Promise.all(
      messageBoxes.map(async (messageBox) => {
        // Filter messages with visibility true for the userId
        const filteredMessageIds = await Promise.all(
          messageBox.messageIds.map(async (messageId: any) => {
            const message = await Message.findById(messageId).select(
              "visibility"
            );
            return message?.visibility?.get(userId) === true ? messageId : null;
          })
        );

        // Filter out null values
        const validMessageIds = filteredMessageIds.filter((id) => id !== null);

        // Get the last valid message
        const lastMessageId = validMessageIds[validMessageIds.length - 1];

        if (!lastMessageId) {
          return {
            ...messageBox.toObject(),
            lastMessage: null,
            readStatus: false,
          };
        }

        // Fetch the last message details
        const lastMessage = await Message.findById(lastMessageId).populate({
          path: "contentId",
          model: "File",
          options: { strictPopulate: false },
        });

        if (!lastMessage) {
          return {
            ...messageBox.toObject(),
            lastMessage: null,
            readStatus: false,
          };
        }

        // Check if the message is read
        const isRead = lastMessage.readedId.includes(userId);
        const readStatus = isRead ? true : false;

        const responseLastMessage: ResponseMessageDTO = {
          id: lastMessage._id,
          flag: lastMessage.flag,
          isReact: lastMessage.isReact,
          readedId: lastMessage.readedId,
          contentId: lastMessage.flag
            ? lastMessage.contentId[lastMessage.contentId.length - 1]
            : undefined,
          text: lastMessage.flag
            ? lastMessage.text[lastMessage.text.length - 1]
            : "Đã thu hồi",
          boxId: lastMessage.boxId.toString(),
          createAt: lastMessage.createAt,
          createBy: lastMessage.createBy,
        };

        return {
          ...messageBox.toObject(),
          responseLastMessage,
          readStatus,
        };
      })
    );

    // Sort message boxes by the last message's creation date (createAt) in descending order
    messageBoxesWithDetails.sort((a, b) => {
      const dateA = a.lastMessage?.createAt
        ? new Date(a.lastMessage.createAt).getTime()
        : 0; // Default to 0 if undefined
      const dateB = b.lastMessage?.createAt
        ? new Date(b.lastMessage.createAt).getTime()
        : 0; // Default to 0 if undefined
      return dateB - dateA; // Sort in descending order (most recent first)
    });

    console.log(messageBoxesWithDetails.map((item) => item.receiverIds));
    return {
      success: true,
      box: messageBoxesWithDetails,
      adminId: userId,
    };
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw error;
  }
}

export async function fetchOneBoxChat(boxId: string, userId: string) {
  try {
    await connectToDatabase();

    // Tìm messageBox theo boxId
    const messageBox = await MessageBox.findById(boxId)
      .populate("senderId", "firstName lastName nickName avatar phoneNumber")
      .populate(
        "receiverIds",
        "firstName lastName nickName avatar phoneNumber status"
      );

    if (!messageBox) {
      return {
        success: false,
        message: "No message boxes found for this boxId",
      };
    }
    // Lấy tin nhắn cuối cùng
    const lastMessageId =
      messageBox.messageIds[messageBox.messageIds.length - 1];

    if (!lastMessageId) {
      return {
        box: {
          ...messageBox.toObject(),
          readStatus: false, // Không có tin nhắn thì mặc định là chưa đọc
        },
      };
    }

    // Tìm tin nhắn cuối cùng
    const lastMessage = await Message.findById(lastMessageId).populate({
      path: "contentId",
      model: "File",
      select: "",
    });

    if (!lastMessage) {
      return {
        box: {
          ...messageBox.toObject(),
          readStatus: false, // Không có tin nhắn thì mặc định là chưa đọc
        },
      };
    }

    // Kiểm tra trạng thái đã đọc
    const readStatus = lastMessage.readedId.includes(userId);

    return {
      box: {
        ...messageBox.toObject(),
        readStatus, // Thêm readStatus vào messageBox
      },
    };
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw error;
  }
}

export async function fetchBoxGroup(userId: string) {
  try {
    await connectToDatabase();

    // Lấy danh sách các nhóm chat
    const messageBoxes = await MessageBox.find({
      $and: [
        { receiverIds: { $in: [userId] } },
        {
          $expr: { $gt: [{ $size: "$receiverIds" }, 2] },
        },
      ],
    })
      .populate(
        "receiverIds",
        "firstName lastName nickName avatar phoneNumber status"
      )
      .populate("senderId", "firstName lastName nickName avatar phoneNumber");

    console.log(messageBoxes);

    if (!messageBoxes.length) {
      return { success: true, box: [] };
    }

    // Xử lý nội dung từng nhóm
    const messageBoxesWithContent: MessageBoxGroupDTO[] = await Promise.all(
      messageBoxes.map(async (messageBox) => {
        // Lọc những messageIds có visibility của userId là true
        const filteredMessageIds = await Promise.all(
          messageBox.messageIds.map(async (messageId: any) => {
            const message = await Message.findById(messageId).select(
              "visibility"
            );
            return message?.visibility?.get(userId) === true ? messageId : null;
          })
        );

        // Lọc bỏ các giá trị null
        const validMessageIds = filteredMessageIds.filter((id) => id !== null);

        // Lấy tin nhắn cuối cùng
        const lastMessageId = validMessageIds[validMessageIds.length - 1];

        if (!lastMessageId) {
          return {
            ...messageBox.toObject(),
            lastMessage: null,
            readStatus: false,
          };
        }

        // Lấy tin nhắn cuối cùng với đầy đủ thông tin
        const populatedMessage = await Message.findById(lastMessageId).populate(
          {
            path: "contentId",
            model: "File",
            select: "",
          }
        );

        if (!populatedMessage) {
          return {
            ...messageBox.toObject(),
            lastMessage: null,
            readStatus: false,
          };
        }

        // Kiểm tra trạng thái đã đọc
        const readStatus = populatedMessage.readedId.includes(userId);
        const responseLastMessage: ResponseMessageDTO = {
          id: populatedMessage._id,
          flag: populatedMessage.flag,
          isReact: populatedMessage.isReact,
          readedId: populatedMessage.readedId,
          contentId: populatedMessage.flag
            ? populatedMessage.contentId[populatedMessage.contentId.length - 1]
            : undefined,
          text: populatedMessage.flag
            ? populatedMessage.text[populatedMessage.text.length - 1]
            : "Message revoked",
          boxId: populatedMessage.boxId.toString(),
          createAt: populatedMessage.createAt,
          createBy: populatedMessage.createBy, // Lấy ID của createBy
        };

        return {
          ...messageBox.toObject(),
          lastMessage: responseLastMessage,
          readStatus,
        };
      })
    );

    console.log(messageBoxesWithContent, "messageBoxesWithContent");

    return { success: true, box: messageBoxesWithContent, adminId: userId };
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw error;
  }
}

export async function getImageList(boxId: string, userId: string) {
  try {
    await connectToDatabase();
    const messageBox = await MessageBox.findById(boxId);
    if (!messageBox || !messageBox.messageIds) {
      throw new Error("MessageBox not found or has no messages");
    }

    const messages: ResponseMessageDTO[] = await Message.find({
      _id: { $in: messageBox.messageIds },
    })
      .select("contentId visibility flag")
      .exec();

    // Lọc các message mà visibility của userId là true
    const visibleMessages = messages.filter((msg: any) => {
      return msg.visibility?.get(userId) === true && msg.flag === true;
    });

    // Lấy danh sách contentId từ các message phù hợp
    const fileIds = visibleMessages.flatMap((msg: any) => msg.contentId);

    const imageFiles: FileContent[] = await File.find({
      _id: { $in: fileIds },
      type: "Image",
    }).exec();

    return imageFiles;
  } catch (error) {
    console.error("Error get image list: ", error);
    throw error;
  }
}

export async function getVideoList(boxId: string, userId: string) {
  try {
    await connectToDatabase();

    // Tìm MessageBox bằng ID
    const messageBox = await MessageBox.findById(boxId);
    if (!messageBox || !messageBox.messageIds) {
      throw new Error("MessageBox not found or has no messages");
    }

    // Lấy danh sách messages với contentId và visibility
    const messages: ResponseMessageDTO[] = await Message.find({
      _id: { $in: messageBox.messageIds },
    })
      .select("contentId visibility flag")
      .exec();

    // Lọc các message mà visibility của userId là true
    const visibleMessages = messages.filter((msg: any) => {
      return msg.visibility?.get(userId) === true;
    });

    // Lấy danh sách contentId từ các message phù hợp
    const fileIds = visibleMessages.flatMap((msg: any) => msg.contentId);

    // Tìm các video từ File collection dựa trên fileIds
    const videoFiles = await File.find({
      _id: { $in: fileIds },
      type: "Video",
    }).exec();

    return videoFiles;
  } catch (error) {
    console.error("Error getting video list: ", error);
    throw error;
  }
}

export async function getAudioList(boxId: string) {
  try {
    await connectToDatabase();
    const messageBox = await MessageBox.findById(boxId);
    if (!messageBox || !messageBox.messageIds) {
      throw new Error("MessageBox not found or has no messages");
    }

    const messages = await Message.find({ _id: { $in: messageBox.messageIds } })
      .select("contentId")
      .exec();

    const fileIds = messages.flatMap((msg: any) => msg.contentId);

    const imageFiles = await File.find({
      _id: { $in: fileIds },
      type: "Audio",
    }).exec();

    return imageFiles;
  } catch (error) {
    console.error("Error get audio list: ", error);
    throw error;
  }
}

export async function getOtherList(boxId: string, userId: string) {
  try {
    await connectToDatabase();
    const messageBox = await MessageBox.findById(boxId);
    if (!messageBox || !messageBox.messageIds) {
      throw new Error("MessageBox not found or has no messages");
    }
    const messages: ResponseMessageDTO[] = await Message.find({
      _id: { $in: messageBox.messageIds },
    })
      .select("contentId visibility")
      .exec();

    // Lọc các message mà visibility của userId là true
    const visibleMessages = messages.filter((msg: any) => {
      return msg.visibility?.get(userId) === true;
    });

    // Lấy danh sách contentId từ các message phù hợp
    const fileIds = visibleMessages.flatMap((msg: any) => msg.contentId);
    const imageFiles = await File.find({
      _id: { $in: fileIds },
      type: "Other",
    }).exec();

    return imageFiles;
  } catch (error) {
    console.error("Error get other list: ", error);
    throw error;
  }
}

export async function removeChatBox(boxId: string) {
  try {
    await connectToDatabase();
    const message = await MessageBox.findById(boxId);
    if (!message) {
      throw new Error("Message not found");
    }

    await MessageBox.findByIdAndDelete(boxId);

    return { success: true, message: "Message removed from database" };
  } catch (error) {
    console.error("Error remove messages from database: ", error);
    throw error;
  }
}

export async function isOnline(userId: string) {
  try {
    await connectToDatabase();

    const statusResponse: StatusResponse = {
      userId: userId,
      status: true,
      createAt: new Date(),
    };

    if (typeof userId !== "string") {
      throw new Error("Invalid userId format");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid ObjectId format");
    }

    const user = await User.findById(new mongoose.Types.ObjectId(userId));

    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { status: true } }
    );

    await pusherServer
      .trigger(`private-${userId}`, "online-status", statusResponse)
      .then(() => console.log("Update online successfully: ", statusResponse))
      .catch((error) => console.error("Failed to update status:", error));
    //return { success: true, populatedMessage, detailBox };
    return {
      success: true,
      message: "Update online status successfully",
      statusResponse,
    };
  } catch (error) {
    console.error("Error update status from database: ", error);
    throw error;
  }
}

export async function isOffline(userId: string) {
  try {
    await connectToDatabase();

    const statusResponse: StatusResponse = {
      userId: userId,
      status: false,
      createAt: new Date(),
    };

    if (typeof userId !== "string") {
      throw new Error("Invalid userId format");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid ObjectId format");
    }

    const user = await User.findById(new mongoose.Types.ObjectId(userId));

    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { status: false } }
    );

    await pusherServer
      .trigger(`private-${userId}`, "offline-status", statusResponse)
      .then(() => console.log("Update offline successfully: ", statusResponse))
      .catch((error) => console.error("Failed to update status:", error));
    //return { success: true, populatedMessage, detailBox };
    return {
      success: true,
      message: "Update offline status successfully",
      statusResponse,
    };
  } catch (error) {
    console.error("Error update status from database: ", error);
    throw error;
  }
}

//MANAGEMENT
export async function getAllMessage() {
  try {
    await connectToDatabase();
    const allMessages = await Message.find();

    const messagesWithContent: ResponseMessageDTO[] = await Promise.all(
      allMessages.map(async (message) => {
        const populatedContent = await mongoose
          .model("File")
          .find({ _id: { $in: message.contentId } });
        return {
          ...message.toObject(),
          content: populatedContent,
        };
      })
    );

    return { success: true, messages: messagesWithContent };
  } catch (error) {
    console.error("Error fetching all messages: ", error);
    throw error;
  }
}

export async function findMessages(
  boxId: string,
  query: string,
  userId: string
) {
  try {
    await connectToDatabase();

    const messageBox = await MessageBox.findById(boxId).populate("messageIds");
    if (!messageBox) {
      throw new Error("Box not found");
    }
    if (messageBox.messageIds.length === 0) {
      return { success: false, messages: [] };
    }

    const messages = await Message.find({
      _id: { $in: messageBox.messageIds },
    }).populate({
      path: "contentId",
      model: "File",
      select: "fileName description", // Select specific fields that you need
      options: { strictPopulate: false },
    });

    const resultMessages: ResponseMessageDTO[] = messages
      .filter((message) => {
        const visibility = message.visibility;
        if (visibility.has(userId) && visibility.get(userId) === false) {
          console.log(
            `Message with ID ${message._id} is not visible to userId ${userId}, skipping.`
          );
          return false; // Loại bỏ tin nhắn này
        }

        // console.log(messages, "this is message for check");

        console.log(
          visibility.has(userId) && visibility.get(userId) === false,
          "messsage nay nek"
        );
        let content: string = "";

        // Check if there's text to search
        if (
          message.text.length > 0 &&
          message.contentId.length === 0 &&
          visibility.has(userId) &&
          visibility.get(userId) === true
        ) {
          // Use the last message.text if it's an array
          content = message.text[message.text.length - 1];
        }
        // Handle contentId (file or description)
        else if (
          message.contentId.length > 0 &&
          visibility.has(userId) &&
          visibility.get(userId) === true
        ) {
          const contentId = message.contentId[message.contentId.length - 1]; // Use the last contentId

          if ("fileName" in contentId) {
            content = contentId.fileName; // For FileContent (File)
          } else if ("description" in contentId) {
            content = contentId.description || ""; // For GPSContent (description)
          }
        }

        // Clean content: remove hidden characters, non-breaking spaces, and trim spaces
        content = content.replace(/\u00A0/g, " ").trim();

        // Debugging: Log the actual matched content and query
        console.log("Query:", query);
        console.log("Content:", content);

        // Check if content is a valid string
        if (typeof content !== "string") {
          console.log("Content is not a string, skipping this message");
          return false; // Skip this message if content is not a string
        }

        // Return true if the content matches the query
        const isMatch = content.toLowerCase().includes(query.toLowerCase());
        console.log(isMatch, "this is message match result");
        return isMatch;
      })
      .map((message) => ({
        id: message._id,
        flag: message.flag,
        isReact: message.isReact,
        readedId: message.readedId,
        contentId: message.contentId,
        text: message.text,
        boxId: message.boxId,
        createAt: message.createAt,
        createBy: message.createBy,
      }));

    return { success: true, messages: resultMessages };
  } catch (error) {
    console.error("Error searching messages: ", error);
    throw error;
  }
}

export async function removeMessage(messageId: string) {
  try {
    await connectToDatabase();
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    await Message.findByIdAndDelete(messageId);

    return { success: true, message: "Message removed from database" };
  } catch (error) {
    console.error("Error remove messages from database: ", error);
    throw error;
  }
}

export async function searchMessages(id?: string, query?: string) {
  try {
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any = {};
    if (id) {
      conditions._id = id;
    }

    const messages = await Message.find(conditions);

    if (query) {
      const populatedMessages: ResponseMessageDTO[] = await Promise.all(
        messages.map(async (message) => {
          const populatedMessage = await Message.findById(message._id).populate(
            {
              path: "contentId",
              model: "File",
              select: "",
              options: { strictPopulate: false },
            }
          );
          return populatedMessage;
        })
      );

      const resultMessages = populatedMessages.filter((populatedMessage) => {
        let content: string = "";
        if (populatedMessage.text.length > 0 && populatedMessage.contentId) {
          content = populatedMessage.text[populatedMessage.text.length - 1];
        } else {
          const contentId = populatedMessage.contentId;
          if ("fileName" in contentId) {
            // contentId là FileContent
            content = contentId.fileName;
          }
        }
        return content
          .toLowerCase()
          .trim()
          .includes(query.toLowerCase().trim());
      });

      if (resultMessages.length === 0) {
        return { success: false, messages: [] };
      }

      return { success: true, messages: resultMessages };
    }

    //if(ID)
    const populatedMessages: ResponseMessageDTO[] = await Promise.all(
      messages.map(async (message) => {
        const populatedMessage = await Message.findById(message._id).populate({
          path: "contentId",
          model: "File",
          select: "",
          options: { strictPopulate: false },
        });
        return populatedMessage;
      })
    );

    return { success: true, populatedMessages };
  } catch (error) {
    console.error("Error searching messages: ", error);
    throw error;
  }
}

export async function fetchManagementBoxChat() {
  try {
    await connectToDatabase();

    const messageBoxes = await MessageBox.find({}).populate(
      "receiverIds",
      "firstName lastName avatar "
    );

    if (!messageBoxes.length) {
      return {
        success: true,
        box: [],
      };
    }

    return {
      success: true,
      box: messageBoxes,
    };
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw error;
  }
}

export async function fetchManagementMessage(boxId: string) {
  try {
    await connectToDatabase();

    // Tìm kiếm MessageBox và populate các messageIds
    const messageBox = await MessageBox.findById(boxId).populate("messageIds");

    if (!messageBox) {
      throw new Error("MessageBox not found");
    }

    // Lọc các tin nhắn có visibility là true đối với userId
    const messagesWithContent: ResponseMessageDTO[] = await Promise.all(
      messageBox.messageIds.map(async (messageId: any) => {
        // Populate nội dung của tin nhắn
        const populatedMessage = await messageId.populate({
          path: "contentId",
          model: "File",
          select: "",
          options: { strictPopulate: false },
        });

        // Tạo DTO cho tin nhắn với nội dung đã populate
        const responseMessage: ResponseMessageDTO = {
          id: populatedMessage._id,
          flag: populatedMessage.flag,
          isReact: populatedMessage.isReact,
          readedId: populatedMessage.readedId,
          contentId: populatedMessage.flag
            ? populatedMessage.contentId[populatedMessage.contentId.length - 1]
            : undefined,
          text: populatedMessage.text[populatedMessage.text.length - 1],
          boxId: populatedMessage.boxId.toString(),
          createAt: populatedMessage.createAt,
          createBy: populatedMessage.createBy,
        };

        return responseMessage;
      })
    );

    // Lọc bỏ các tin nhắn không hợp lệ (null)
    const validMessages = messagesWithContent.filter(Boolean);

    return { success: true, messages: validMessages };
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw error;
  }
}
