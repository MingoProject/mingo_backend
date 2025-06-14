import { io } from "../server.js";

const onCallAccepted = async (data) => {
  console.log("Call accepted:", data);

  const { ongoingCall } = data;

  if (!ongoingCall || !ongoingCall.participants) {
    console.error("Invalid ongoing call data in callAccepted");
    return;
  }

  const caller = ongoingCall.participants.caller;

  console.log(caller, "caller in accept");

  // Tìm socketId của caller để gửi thông báo
  const callerSocketId = caller.socketId;

  if (callerSocketId) {
    // Gửi thông báo cho caller rằng cuộc gọi đã được chấp nhận
    io.to(callerSocketId).emit("callAccepted", {
      ongoingCall,
      message: "Call has been accepted",
    });

    console.log(`Call accepted notification sent to caller ${caller.userId}`);
  } else {
    console.error("Caller socket ID not found");
  }
};

export default onCallAccepted;
