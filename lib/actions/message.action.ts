"use client";

import Chat from "@/database/chat.model";
import { connectToDatabase } from "../mongoose";
import Message from "@/database/message.model";
import userModel from "@/database/user.model";
import mongoose, { Types } from "mongoose";
import { ChatDTO, SegmentMessageDTO } from "@/dtos/MessageDTO";
import Text from "@/database/text.model";
import Image from "@/database/image.model";
import Icon from "@/database/icon.model";
import Video from "@/database/video.model";
import Voice from "@/database/voice.model";

async function createContent(data: SegmentMessageDTO) {
  let contentModel: string;
  let contentId: mongoose.Types.ObjectId;
  const userObjectId = new Types.ObjectId(data.userId);

  if (typeof data.content === "string") {
    contentModel = "Text";
    const textContent = await Text.create({
      content: data.content,
      createBy: userObjectId,
    });
    contentId = textContent._id;
  } else if (data.content.type === "image") {
    contentModel = "Image";
    const imageContent = await Image.create({
      fileName: data.content.altText,
      path: data.content.url,
      size: 0,
      createBy: userObjectId,
    });
    contentId = imageContent._id;
  } else if (data.content.type === "link") {
    contentModel = "Text";
    const textContent = await Text.create({
      content: data.content.url,
      createBy: userObjectId,
    });
    contentId = textContent._id;
  } else if (data.content.type === "file") {
    contentModel = "Text";
    const textContent = await Text.create({
      content: data.content.fileName + "-" + data.content.fileUrl,
      createBy: userObjectId,
    });
    contentId = textContent._id;
  } else if (data.content.type === "icon") {
    contentModel = "Icon";
    const iconContent = await Icon.create({
      content: data.content.name,
      createBy: userObjectId,
    });
    contentId = iconContent._id;
  } else if (data.content.type === "video") {
    contentModel = "Video";
    const videoContent = await Video.create({
      fileName: data.content.fileName,
      path: data.content.fileUrl,
      size: data.content.duration,
      createBy: userObjectId,
    });
    contentId = videoContent._id;
  } else if (data.content.type === "voice") {
    contentModel = "Voice";
    const voiceContent = await Voice.create({
      fileName: data.content.fileName,
      path: data.content.fileUrl,
      size: data.content.duration,
      createBy: userObjectId,
    });
    contentId = voiceContent._id;
  } else {
    throw new Error("Invalid content type");
  }

  const message = await Message.create({
    flag: true,
    readedId: [data.userId],
    contentModel: contentModel,
    contentId: [contentId],
    createdAt: new Date(),
    updatedAt: new Date(),
    createBy: userObjectId,
  });

  return message;
}

export async function createMessage(data: SegmentMessageDTO) {
  try {
    await connectToDatabase();

    if ((!data.userId && !data.recipientId) || data.recipientId.length === 0) {
      throw new Error("User ID and Recipient ID is required");
    }

    const userExists = await userModel.exists({ _id: data.userId });

    if (!userExists) {
      throw new Error("User does not exist");
    }

    if (!Array.isArray(data.recipientId) || data.recipientId.length === 0) {
      throw new Error("recipientId must be a non-empty array");
    }

    const recipientsExist = await userModel
      .find({
        _id: { $in: data.recipientId },
      })
      .limit(1);

    if (recipientsExist.length === 0) {
      throw new Error("Recipients do not exist");
    }

    const userObjectId = new Types.ObjectId(data.userId);

    if ("groupId" in data && data.groupId) {
      let groupChat = await Chat.findById(data.groupId);
      if (!groupChat) {
        throw new Error("Group Chat not found");
      }
      const membersIds = groupChat.receiver_ids.push(groupChat.sender_id);
      const allRecipientsExist = data.recipientId.every((recipient) =>
        membersIds.includes(recipient)
      );
      const leaderExists = membersIds.includes(data.userId);

      if (!allRecipientsExist || !leaderExists) {
        throw new Error(
          "All recipientIds and userId must be in MembersId list"
        );
      }

      const message = await createContent(data);

      const populatedMessage = await Message.findById(message._id).populate({
        path: "contentId",
        model: message.contentModel,
        select: "",
        options: { strictPopulate: false },
      });

      groupChat = await Chat.findByIdAndUpdate(
        data.groupId,
        {
          $push: { message_ids: message._id },
          $addToSet: { receiver_ids: { $each: data.recipientId } },
          $set: { sender_id: data.userId },
        },
        { new: true }
      );

      if (!groupChat) {
        throw new Error("Group Chat cannot update");
      }

      return { success: true, populatedMessage, groupChat };
    } else {
      if (data.recipientId.length > 1) {
        throw new Error("Should create group before sending");
      } else {
        const message = await createContent(data);
        const populatedMessage = await Message.findById(message._id).populate({
          path: "contentId",
          model: message.contentModel,
          select: "",
          options: { strictPopulate: false },
        });
        let chat = await Chat.findOneAndUpdate(
          {
            sender_id: data.userId,
            $addToSet: { receiver_ids: { $each: data.recipientId } },
          },
          { $push: { message_ids: message._id } },
          { new: true }
        );

        if (!chat) {
          const recipientExists = await userModel.exists({
            _id: { $in: data.recipientId },
          });

          if (!recipientExists) {
            throw new Error("Recipient does not exist");
          }

          chat = await Chat.create({
            sender_id: data.userId,
            receiver_ids: data.recipientId,
            message_ids: [message._id],
            flag: true,
            createBy: userObjectId,
          });
        }
        return { success: true, populatedMessage, Chat };
      }
    }
  } catch (error) {
    console.error("Error sending message: ", error);
    throw error;
  }
}

// export async function fetchMessage(chatId: string) {
//   try {
//     await connectToDatabase();

//     // Tìm kiếm Chat theo ID và populate trường message_ids
//     const chat = await Chat.findById(chatId).populate("message_ids");

//     if (!chat) {
//       return { success: false, messages: [] }; // Nếu không tìm thấy chat, trả về false và mảng rỗng
//     }

//     // Duyệt qua các message_ids và tìm từng tin nhắn kèm nội dung
//     const chatWithContent = await Promise.all(
//       chat.message_ids.map(async (message_id: any) => {
//         const message = await Message.findById(message_id);

//         if (!message) {
//           throw new Error(`Message not found for ID: ${message_id}`);
//         }

//         // Populate nội dung của tin nhắn
//         const populatedMessage = await Message.findById(message_id).populate({
//           path: "contentId",
//           model: message.contentModel,
//           select: "",
//           options: { strictPopulate: false },
//         });

//         return populatedMessage;
//       })
//     );

//     // Trả về kết quả thành công cùng với danh sách tin nhắn
//     return { success: true, messages: chatWithContent };
//   } catch (error) {
//     console.error("Error fetching message: ", error);
//     return { success: false, messages: [] }; // Nếu có lỗi, trả về false và mảng rỗng
//   }
// }

export async function fetchMessage(chatId: string) {
  try {
    await connectToDatabase();

    // Xóa khoảng trắng và ký tự xuống dòng từ chatId
    const cleanChatId = chatId.trim();

    // Tìm kiếm Chat theo ID và populate trường message_ids
    const chat = await Chat.findById(cleanChatId).populate("message_ids");

    if (!chat || !chat.message_ids || chat.message_ids.length === 0) {
      console.log(
        `Chat with ID ${cleanChatId} not found or has no message_ids`
      );
      return { success: false, messages: [] };
    }

    // Duyệt qua các message_ids và tìm từng tin nhắn kèm nội dung
    const chatWithContent = await Promise.all(
      chat.message_ids.map(async (message_id: any) => {
        console.log(`Fetching message with ID: ${message_id}`);
        const message = await Message.findById(message_id);

        if (!message) {
          console.warn(`Message not found for ID: ${message_id}`);
          return null; // Bỏ qua tin nhắn không tồn tại
        }

        // Kiểm tra và populate nội dung của tin nhắn
        const populatedMessage = await Message.findById(message_id).populate({
          path: "contentId",
          model: message.contentModel,
          select: "",
          options: { strictPopulate: false },
        });

        if (!populatedMessage?.contentId) {
          console.warn(`Content not found for message ID: ${message_id}`);
          return null; // Bỏ qua tin nhắn nếu không có nội dung
        }

        return populatedMessage;
      })
    );

    // Lọc ra các tin nhắn hợp lệ
    const validMessages = chatWithContent.filter((msg) => msg !== null);

    // Trả về kết quả thành công cùng với danh sách tin nhắn
    return { success: true, messages: validMessages };
  } catch (error) {
    console.error("Error fetching message: ", error);
    return { success: false, messages: [] };
  }
}

// export async function createGroup(adminId: string, memberIds: string[]) {
//   const checkExistAdmin = await userModel.exists({ userId: adminId });

//   if (!checkExistAdmin) {
//     throw new Error("Admin id does not exist!!!");
//   }

//   const checkExistMembers = await userModel.exists({
//     userId: { $in: memberIds },
//   });

//   if (!checkExistMembers) {
//     throw new Error("One or more member ids do not exist!!!");
//   }

//   if (!Array.isArray(memberIds) || memberIds.length <= 1) {
//     throw new Error("Member ids must be large than 2");
//   }

//   const userObjectId = new Types.ObjectId(adminId);

//   const chat = await Chat.create({
//     sender_id: adminId,
//     receiver_ids: memberIds,
//     message_ids: [],
//     status: true,
//     createBy: userObjectId,
//   });

//   return { success: true, chatId: chat._id, chat };
// }

export async function createGroup(adminId: string, memberIds: string[]) {
  const users = await userModel.find({
    userId: { $in: [adminId, ...memberIds] },
  });
  const userIds = users.map((user) => user.userId);

  if (!userIds.includes(adminId)) {
    throw new Error("Admin id does not exist!!!");
  }

  const nonExistentMembers = memberIds.filter((id) => !userIds.includes(id));
  if (nonExistentMembers.length > 0) {
    throw new Error("One or more member ids do not exist!!!");
  }

  if (memberIds.length <= 1) {
    throw new Error("Member ids must be larger than 2");
  }

  const userObjectId = new Types.ObjectId(adminId);

  const chat = await Chat.create({
    sender_id: adminId,
    receiver_ids: memberIds,
    message_ids: [],
    status: true,
    createBy: userObjectId,
  });

  return { success: true, chatId: chat._id, chat };
}

export async function recieveMessage(messageId: string) {
  try {
    await connectToDatabase();
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("Message not found!!!");
    }

    return { success: true, message };
  } catch (error) {
    console.error("Error recieving message: ", error);
    throw error;
  }
}

// export async function editMessage(
//   messageId: string,
//   contentId: string,
//   newContent: SegmentMessageDTO["content"],
//   userId: string
// ) {
//   try {
//     await connectToDatabase();

//     const message = await Message.findById(messageId);

//     if (!message) {
//       throw new Error("Message not found!!!");
//     }

//     if (message.readed_ids.includes(userId)) {
//       const contentIndex = message.contentId.findIndex(
//         (id: { toString: () => string }) => id.toString() === contentId
//       );

//       if (contentIndex === -1) {
//         throw new Error("Content not found");
//       }

//       if (message.contentModel === "Text") {
//         const userObjectId = new Types.ObjectId(userId);

//         const newText = await Text.create({
//           content: newContent,
//           createBy: userObjectId,
//         });

//         message.contentId.push(newText._id);
//         message.updatedAt = new Date();
//         const updatedMessage = await Message.findById(messageId).populate(
//           "contentId"
//         );
//         return { success: true, updatedMessage };
//       } else {
//         throw new Error("Only text canbe edited");
//       }
//     }
//   } catch (error) {
//     console.error("Error edit message", error);
//   }
// }

// export async function DeletOrRevokeMessage(
//   messageId: string,
//   userId: string,
//   action: "delete" | "recover"
// ) {
//   try {
//     await connectToDatabase();

//     const message = await Message.findById(messageId);

//     if (!message) {
//       throw new Error("Message not found!!!");
//     }

//     if (!message.readed_ids.includes(userId)) {
//       throw new Error("Unauthorized to delete or recall this message");
//     }

//     if (action === "delete") {
//       message.status = false;
//       await message.save();
//       return { success: true, message: "Message deleted!!!" };
//     } else if (action == "recover") {
//       const recoverContent = "Message is recover";
//       const message = await Message.findById(messageId);
//       const contentIdToRecover =
//         message.contentId[message.lenght - 1].toString();
//       console.log(contentIdToRecover);
//       await editMessage(messageId, contentIdToRecover, recoverContent, userId);
//       return { success: true, message: "Message is recovered!!!" };
//     } else {
//       throw new Error("Invalid action!!!");
//     }
//   } catch (error) {
//     console.error("Error delete or recalling message!!!");
//   }
// }

export async function editMessage(
  messageId: string,
  contentId: string,
  newContent: SegmentMessageDTO["content"],
  userId: string
) {
  try {
    await connectToDatabase();

    const message = await Message.findById(messageId);

    if (!message) {
      return { success: false, message: "Message not found!" };
    }

    if (!message.readed_ids.includes(userId)) {
      return { success: false, message: "User has not read the message yet" };
    }

    const contentIndex = message.contentId.findIndex(
      (id: { toString: () => string }) => id.toString() === contentId
    );

    if (contentIndex === -1) {
      return { success: false, message: "Content not found" };
    }

    if (message.contentModel === "Text") {
      const userObjectId = new Types.ObjectId(userId);

      const newText = await Text.create({
        content: newContent,
        createBy: userObjectId,
      });

      message.contentId.push(newText._id);
      message.updatedAt = new Date();

      const updatedMessage = await Message.findById(messageId).populate(
        "contentId"
      );

      return { success: true, updatedMessage };
    } else {
      return { success: false, message: "Only text can be edited" };
    }
  } catch (error) {
    console.error("Error editing message:", error);
    return {
      success: false,
      message: "An error occurred while editing the message",
    };
  }
}

export async function DeletOrRevokeMessage(
  messageId: string,
  userId: string,
  action: "delete" | "recover"
) {
  try {
    await connectToDatabase();

    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Không tìm thấy tin nhắn");
    }

    // Cho phép xóa nếu người dùng là người tạo hoặc có quyền "read" tin nhắn
    if (
      message.createBy.toString() !== userId &&
      !message.readed_ids.includes(userId)
    ) {
      throw new Error("Bạn không có quyền xóa hoặc thu hồi tin nhắn này");
    }

    if (action === "delete") {
      message.status = false;
      await message.save();
      return { success: true, message: "Tin nhắn đã được xóa" };
    } else if (action === "recover") {
      const recoverContent = "Tin nhắn đã được khôi phục";
      const contentIdToRecover =
        message.contentId[message.contentId.length - 1].toString();

      await editMessage(messageId, contentIdToRecover, recoverContent, userId);
      return { success: true, message: "Tin nhắn đã được khôi phục" };
    } else {
      throw new Error("Hành động không hợp lệ");
    }
  } catch (error) {
    console.error("Lỗi khi xóa hoặc thu hồi tin nhắn:", error);
    return { success: false, message: "Lỗi xử lý hành động tin nhắn" };
  }
}

export async function findMessages(chatId: string, query: string) {
  try {
    await connectToDatabase();

    const chat = await Chat.findById(chatId).populate("message_ids");
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.message_ids.length === 0) {
      return { success: false, messages: [] };
    }

    const messages = await Message.find({
      _id: { $in: chat.message_ids },
    }).populate("contentId");

    let filteredMessages = messages;

    filteredMessages = messages.filter((message) => {
      return message.contentModel === "Text";
    });

    const populatedMessages = await Promise.all(
      filteredMessages.map(async (message) => {
        const populatedMessage = await Message.findById(message._id).populate({
          path: "contentId",
          model: message.contentModel,
          select: "",
        });
        return populatedMessage;
      })
    );

    const resultMessages = populatedMessages.filter((populatedMessage) => {
      const content =
        populatedMessage?.contentId[populatedMessage?.contentId.length - 1];
      return (
        content.content &&
        content.content
          .toLowerCase()
          .trim()
          .includes(query.toLowerCase().trim())
      );
    });

    if (resultMessages.length === 0) {
      return { success: false, messages: [] };
    }

    return { success: true, messages: resultMessages };
  } catch (error) {
    console.error("Error searching messages: ", error);
    throw error;
  }
}

// export async function getAllChatsForUser(userId: string): Promise<{
//   success: boolean;
//   chats?: ChatDTO[];
//   message?: string;
// }> {
//   try {
//     await connectToDatabase();

//     const chats = await Chat.find({
//       $or: [
//         { sender_id: new Types.ObjectId(userId) },
//         { receiver_ids: new Types.ObjectId(userId) },
//       ],
//     }).populate({
//       path: "message_ids",
//       populate: {
//         path: "contentId",
//         model: "ContentModel", // Replace this with specific models as needed
//       },
//     });

//     if (!chats.length) {
//       return { success: false, message: "No chats found" };
//     }

//     const formattedChats = chats.map((chat) => ({
//       messageBoxId: chat._id.toString(),
//       messageBox: {
//         senderId: chat.sender_id.toString(),
//         receiverIds: chat.receiver_ids.map((id) => id.toString()),
//         messageIds: chat.message_ids.map((msg) => msg.toString()),
//         flag: chat.status,
//         createAt: chat.createdAt,
//         createBy: chat.createdBy,
//       },
//     }));

//     return { success: true, chats: formattedChats };
//   } catch (error) {
//     console.error("Error fetching chats:", error);
//     return {
//       success: false,
//       message: "An error occurred while fetching chats",
//     };
//   }
// }

//MANAGEMENT
export async function getAllMessage() {
  try {
    await connectToDatabase();
    const allMessages = await Message.find();

    const messagesWithContent = await Promise.all(
      allMessages.map(async (message) => {
        const populatedContent = await mongoose
          .model(message.contentModel)
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

export async function removeMessage(messageId: string) {
  try {
    await connectToDatabase();
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const { contentModel, contentId: contentIds } = message;

    let ContentModel;
    switch (contentModel) {
      case "Text":
        ContentModel = Text;
        break;
      case "Image":
        ContentModel = Image;
        break;
      case "Video":
        ContentModel = Video;
        break;
      case "Voice":
        ContentModel = Voice;
        break;
      default:
        throw new Error("Invalid content model");
    }

    await ContentModel.deleteMany({ _id: { $in: contentIds } });

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

    let filteredMessages = messages;

    if (query) {
      filteredMessages = messages.filter((message) => {
        return message.contentModel === "Text";
      });

      const populatedMessages = await Promise.all(
        filteredMessages.map(async (message) => {
          const populatedMessage = await Message.findById(message._id).populate(
            {
              path: "contentId",
              model: message.contentModel,
              select: "",
            }
          );
          return populatedMessage;
        })
      );

      const resultMessages = populatedMessages.filter((populatedMessage) => {
        const content =
          populatedMessage?.contentId[populatedMessage?.contentId.length - 1];
        return (
          content.content &&
          content.content
            .toLowerCase()
            .trim()
            .includes(query.toLowerCase().trim())
        );
      });

      if (resultMessages.length === 0) {
        return { success: false, messages: [] };
      }

      return { success: true, messages: resultMessages };
    }

    //if(ID)
    const populatedMessages = await Promise.all(
      filteredMessages.map(async (message) => {
        const populatedMessage = await Message.findById(message._id).populate({
          path: "contentId",
          model: message.contentModel,
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
