import { io } from "../server.js";

const onCall = async (participants, isVideoCall, boxId) => {
  console.log(participants, boxId, "this is participant");

  if (participants.receiver.socketId) {
    // Gửi tin nhắn riêng cho socket đó qua socketId
    // io.to(`${socketId}`).emit('hey', 'I just met you');
    io.to(participants.receiver.socketId).emit(
      "incomingCall",
      participants,
      isVideoCall,
      boxId
    );
  }
};

export default onCall;
