import {
  MessageDTO,
  ResponseMessageBoxDTO,
  ResponseSendingDTO,
  SegmentMessageDTO,
} from "@/dtos/MessageDTO";
import { FriendResponseDTO } from "@/dtos/FriendDTO";
import { OTPResponseDTO } from "@/dtos/OTPDTO";
import { SingleMessageResponseDTO } from "@/dtos/ShareDTO";
import { AuthenticationDTO, UserResponseDTO } from "@/dtos/UserDTO";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const Contract = c.router(
  {
    auth: c.router({
      login: {
        method: "POST",
        path: "/api/auth/login",
        responses: {
          200: c.type<AuthenticationDTO>(),
        },
        headers: z.object({}),
        body: z.object({
          phoneNumber: z.string(),
          password: z.string(),
        }),
        summary: "Login",
        metadata: { role: "guest" } as const,
      },
      logout: {
        method: "POST",
        path: "/api/auth/logout",
        responses: {
          200: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({}),
        headers: z.object({}),
        summary: "Logout",
        metadata: { role: "guest" } as const,
      },
      sendOTP: {
        method: "POST",
        path: "/api/auth/send-otp",
        responses: {
          200: c.type<OTPResponseDTO>(),
        },
        headers: z.object({}),
        body: z.object({
          phonenumber: z.string(),
        }),
        summary: "Get otp",
        metadata: { role: "guest" } as const,
      },
      verifyOTP: {
        method: "POST",
        path: "/api/auth/verify-otp",
        responses: {
          200: c.type<SingleMessageResponseDTO>(),
        },
        headers: z.object({}),
        body: z.object({
          phonenumber: z.string(),
        }),
        summary: "Verify otp",
        metadata: { role: "guest" } as const,
      },
    }),
    user: c.router({
      createAdmin: {
        method: "POST",
        path: "/api/user/create-admin",
        responses: {
          201: c.type<UserResponseDTO>(),
        },
        body: z.object({
          firstName: z.string(),
          lastName: z.string(),
          nickName: z.string().optional(),
          phoneNumber: z.string(),
          email: z.string().email(),
          password: z.string(),
          rePassword: z.string(),
          gender: z.boolean(),
          address: z.string(),
          birthDay: z.date(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Create a admin",
        metadata: { role: "admin" } as const,
      },
      getAllUsers: {
        method: "GET",
        path: "/api/user/all",
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        responses: {
          200: c.type<{ users: UserResponseDTO[]; total: number }>(),
        },
        summary: "Get all users",
      },
      register: {
        method: "POST",
        path: "/api/user/register",
        responses: {
          201: c.type<UserResponseDTO>(),
        },
        body: z.object({
          firstName: z.string(),
          lastName: z.string(),
          nickName: z.string().optional(),
          phoneNumber: z.string(),
          email: z.string().email(),
          password: z.string(),
          rePassword: z.string(),
          gender: z.boolean(),
          address: z.string(),
          birthDay: z.date(),
        }),
        headers: z.object({}),
        summary: "Register",
        metadata: { role: "guest" } as const,
      },
      updateUser: {
        method: "PATCH",
        path: "/api/user/update",
        responses: {
          201: c.type<UserResponseDTO>(),
        },
        body: z.object({
          firstName: z.string(),
          lastName: z.string(),
          nickName: z.string().optional(),
          phoneNumber: z.string(),
          email: z.string().email(),
          password: z.string(),
          rePassword: z.string(),
          gender: z.boolean(),
          address: z.string(),
          birthDay: z.date(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Update a user",
        metadata: { role: "user" } as const,
      },
      disableUser: {
        method: "POST",
        path: "/api/user/disable",
        responses: {
          201: c.type<UserResponseDTO>(),
        },
        body: z.object({}),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        query: z.object({
          id: z.string(),
        }),
        summary: "Disable a user",
        metadata: { role: "admin" } as const,
      },
      findUser: {
        method: "POST",
        path: "/api/user/find",
        responses: {
          201: c.type<UserResponseDTO>(),
        },
        body: z.object({}),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        query: z.object({
          phonenumber: z.string(),
        }),
        summary: "Disable a user",
        metadata: { role: "admin" } as const,
      },
    }),
    friend: c.router({
      addFriend: {
        method: "POST",
        path: "/api/request/friend",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Add friend",
        metadata: { role: "user" } as const,
      },
      addBFF: {
        method: "POST",
        path: "/api/request/bff",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Add bestfriend",
        metadata: { role: "user" } as const,
      },
      block: {
        method: "POST",
        path: "/api/request/block",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Block a user",
        metadata: { role: "user" } as const,
      },
      acceptFriend: {
        method: "POST",
        path: "/api/request/accept-friend",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Accept a friend request",
        metadata: { role: "user" } as const,
      },
      acceptBFF: {
        method: "POST",
        path: "/api/request/accept-bff",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Accept a bestfriend request",
        metadata: { role: "user" } as const,
      },
      unFriend: {
        method: "POST",
        path: "/api/request/unfriend",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Unfriend",
        metadata: { role: "user" } as const,
      },
      unBFF: {
        method: "POST",
        path: "/api/request/unbff",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Unbestfriend",
        metadata: { role: "user" } as const,
      },
      unBlock: {
        method: "POST",
        path: "/api/request/unblock",
        responses: {
          201: c.type<SingleMessageResponseDTO>(),
        },
        body: z.object({
          sender: z.string(),
          receiver: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Unblock",
        metadata: { role: "user" } as const,
      },
      requestFriendProfile: {
        method: "GET",
        path: "/api/friend/profile",
        responses: {
          201: c.type<UserResponseDTO>(),
        },
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        query: z.object({
          friendId: z.string(),
        }),
        summary: "Friend Profile",
        metadata: { role: "user" } as const,
      },
    }),
    mine: c.router({
      profile: {
        method: "GET",
        path: "/api/mine/profile",
        responses: {
          201: c.type<UserResponseDTO>(),
        },
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "My Profile",
        metadata: { role: "user" } as const,
      },
      friends: {
        method: "GET",
        path: "/api/mine/friends",
        responses: {
          201: c.type<FriendResponseDTO[]>(),
        },
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "My Friends",
        metadata: { role: "user" } as const,
      },
      bffs: {
        method: "GET",
        path: "/api/mine/bffs",
        responses: {
          201: c.type<FriendResponseDTO[]>(),
        },
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "My estfriends",
        metadata: { role: "user" } as const,
      },
      blocks: {
        method: "GET",
        path: "/api/mine/blocks",
        responses: {
          201: c.type<FriendResponseDTO[]>(),
        },
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "My Blocks",
        metadata: { role: "user" } as const,
      },
      requested: {
        method: "GET",
        path: "/api/mine/requested",
        responses: {
          201: c.type<FriendResponseDTO[]>(),
        },
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "My Requested",
        metadata: { role: "user" } as const,
      },
    }),
    message: c.router({
      all: {
        method: "GET",
        path: "/api/message/all",
        responses: {
          200: c.type<SegmentMessageDTO[]>(),
          400: c.type<{ message: string }>(),
          404: c.type<{ message: string }>(),
          500: c.type<{ message: string; error?: string }>(),
        },
        query: z.object({
          boxId: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Get all messages of a certain message-box",
        description:
          "Fetches all messages for a specific message-box using its `boxId`.",
      },
      createGroup: {
        method: "POST",
        path: "/api/message/create-group",
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        body: z.object({
          membersIds: z.array(z.string()).nonempty(),
          leaderId: z.string(),
        }),
        responses: {
          200: c.type<{ success: true; data: ResponseMessageBoxDTO }>(),
          400: c.type<{ success: false; message: string }>(),
          500: c.type<{ success: false; message: string }>(),
        },
        summary: "Create a new group",
        description:
          "Creates a new group with specified member IDs and a leader ID.",
        metadata: { role: "user" } as const,
      },
      deleteMessage: {
        method: "DELETE",
        path: "/api/message/delete",
        responses: {
          200: c.type<{
            success: boolean;
            messageId?: string;
            message?: string;
          }>(),
          400: c.type<{
            success: boolean;
            message: string;
          }>(),
          401: c.type<{
            success: boolean;
            message: string;
          }>(),
          500: c.type<{
            success: boolean;
            message: string;
          }>(),
        },
        query: z.object({
          messageId: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Delete a message",
        metadata: { role: "user" } as const,
      },
      editMessage: {
        method: "PUT",
        path: "/api/message/edit",
        responses: {
          200: c.type<{
            success: boolean;
            message: MessageDTO;
          }>(),
          400: c.type<{
            success: boolean;
            message: string;
          }>(),
          401: c.type<{
            success: boolean;
            message: string;
          }>(),
          500: c.type<{
            message: string;
            error?: string;
          }>(),
        },
        body: z.object({
          messageId: z.string(),
          contentId: z.string(),
          newContent: z.any(),
          userId: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Edit a message",
        metadata: { role: "user" } as const,
      },
      markAsRead: {
        method: "POST",
        path: "/api/message/mark-read",
        responses: {
          200: c.type<{
            success: boolean;
            lastMessage: MessageDTO;
            messages: string;
          }>(),
        },
        body: z.object({
          boxId: z.string(),
          recipientIds: z.array(z.string()),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        query: z.object({}),
        summary: "Mark messages as read",
        metadata: { role: "admin" } as const,
      },
      revokeMessage: {
        method: "DELETE",
        path: "/api/message/delete",
        responses: {
          200: c.type<{
            success: boolean;
            messageId?: string;
            message?: string;
          }>(),
          400: c.type<{
            success: boolean;
            message: string;
          }>(),
          401: c.type<{
            success: boolean;
            message: string;
          }>(),
          500: c.type<{
            success: boolean;
            message: string;
          }>(),
        },
        query: z.object({
          messageId: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Revoke a message",
      },
      findMessages: {
        method: "GET",
        path: "/api/message/find",
        responses: {
          200: c.type<{
            success: boolean;
            data: MessageDTO[];
          }>(),
          500: c.type<{
            success: boolean;
            message: string;
          }>(),
        },
        query: z.object({
          id: z.string().optional(),
          query: z.string().optional(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Search messages by ID and query",
        metadata: { role: "user" } as const,
      },
      sendMessage: {
        method: "POST",
        path: "/api/message/send",
        responses: {
          200: c.type<{
            success: boolean;
            message: string;
            result: ResponseSendingDTO;
          }>(),
          500: c.type<{
            success: boolean;
            message: string;
          }>(),
        },
        body: z.object({
          content: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Send a message",
        metadata: { role: "user" } as const,
      },
      listMessages: {
        method: "GET",
        path: "/api/message/management/list",
        responses: {
          200: c.type<{
            success: boolean;
            messages: Array<MessageDTO>;
          }>(),
          404: c.type<{
            message: string;
          }>(),
          500: c.type<{
            message: string;
            error?: string;
          }>(),
        },
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Get all messages from the management list",
        metadata: { role: "admin" } as const,
      },
      removeMessage: {
        method: "DELETE",
        path: "/api/message/management/remove",
        responses: {
          200: c.type<{
            success: boolean;
            message: string;
          }>(),
          400: c.type<{
            success: boolean;
            message: string;
          }>(),
          401: c.type<{
            success: boolean;
            message: string;
          }>(),
          500: c.type<{
            success: boolean;
            message: string;
          }>(),
        },
        query: z.object({
          messageId: z.string(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Remove a message from database",
        metadata: { role: "admin" } as const,
      },
      searchMessages: {
        method: "GET",
        path: "/api/message/management/search",
        responses: {
          200: c.type<{
            success: boolean;
            messages: Array<MessageDTO>;
          }>(),
          404: c.type<{
            success: boolean;
            message: string;
          }>(),
          500: c.type<{
            success: boolean;
            message: string;
            error?: string;
          }>(),
        },
        query: z.object({
          id: z.string().optional(),
          query: z.string().optional(),
        }),
        headers: z.object({
          auth: z
            .string()
            .regex(
              /^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
            ),
        }),
        summary: "Search messages by ID and query",
        metadata: { role: "admin" } as const,
      },
    }),
  },
  {
    baseHeaders: z.object({
      isOpenApi: z.boolean().default(true),
    }),
  }
);
