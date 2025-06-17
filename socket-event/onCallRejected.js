import { io } from "../server.js";

const onCallRejected = async (data) => {
  console.log("Call rejected:", data);

  const { ongoingCall, rejectedBy } = data;

  if (!ongoingCall || !ongoingCall.participants) {
    console.error("Invalid ongoing call data in callRejected");
    return;
  }

  const caller = ongoingCall.participants.caller;

  console.log(caller, "caller in reject");

  // Tìm socketId của caller để gửi thông báo
  const callerSocketId = caller.socketId;

  if (callerSocketId) {
    // Gửi thông báo cho caller rằng cuộc gọi đã bị từ chối
    io.to(callerSocketId).emit("callRejected", {
      rejectedBy,
      ongoingCall,
      message: "Call has been rejected",
    });

    console.log(`Call rejected notification sent to caller ${caller.userId}`);
  } else {
    console.error("Caller socket ID not found");
  }
};

export default onCallRejected;
