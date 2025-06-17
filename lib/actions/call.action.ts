import Call from "@/database/call.model";
import { connectToDatabase } from "../mongoose";

export async function getCallHistory(userId: string) {
  try {
    await connectToDatabase();

    // Retrieve call history where either the caller or receiver is the user
    const callHistory = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    }).populate("callerId receiverId", "firstName lastName phoneNumber");

    if (!callHistory.length) {
      return {
        success: true,
        message: "No call history found.",
        callHistory: [],
      };
    }

    return {
      success: true,
      callHistory,
    };
  } catch (error) {
    console.error("Error fetching call history: ", error);
    throw error;
  }
}

export async function createCall(callData: {
  callerId: string;
  receiverId: string;
  callType: "video" | "voice";
  startTime: Date;
  createBy: string; // Add the createBy field
  status: "completed" | "missed" | "rejected" | "ongoing"; // Add status field
  endTime?: Date; // Optional, because it may not be present for ongoing calls
}) {
  try {
    await connectToDatabase(); // Ensure DB connection

    const { startTime, status, endTime } = callData;

    let duration = 0;

    // Calculate duration based on call status
    if (
      status === "completed" ||
      status === "rejected" ||
      status === "missed"
    ) {
      if (endTime) {
        duration = Math.floor(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
        ); // Duration in seconds
      }
    } else if (status === "ongoing") {
      // For ongoing calls, calculate duration based on current time
      duration = Math.floor(
        (new Date().getTime() - new Date(startTime).getTime()) / 1000
      ); // Duration in seconds
    }

    // Create a new Call document
    const newCall = new Call({
      callerId: callData.callerId,
      receiverId: callData.receiverId,
      callType: callData.callType,
      startTime: callData.startTime,
      status: callData.status, // Use the passed status
      duration: duration, // Set the calculated duration
      createBy: callData.createBy, // Add the creator
    });

    // Save the new call to the database
    await newCall.save();

    return {
      success: true,
      message: "Call started successfully",
      call: newCall,
    };
  } catch (error) {
    console.error("Error creating call: ", error);
    throw error;
  }
}

export async function updateCallStatus(callId: any, updateData: any) {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  if (updateData.endTime) {
    const duration = Math.floor(
      (updateData.endTime.getTime() - call.startTime.getTime()) / 1000
    );
    updateData.duration = duration;
  }

  return await Call.findByIdAndUpdate(callId, updateData, { new: true });
}
