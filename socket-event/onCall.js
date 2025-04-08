import { io } from "../server.js";

const onCall = async (participants) => {
  if (participants.receiver.socketId) {
    // Gửi tin nhắn riêng cho socket đó qua socketId
    // io.to(`${socketId}`).emit('hey', 'I just met you');
    io.to(participants.receiver.socketId).emit("incomingCall", participants);
  }
};

export default onCall;
