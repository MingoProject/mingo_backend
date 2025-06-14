import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import onCall from "./socket-event/onCall.js";
import onCallAccepted from "./socket-event/onCallAccepted.js";
import onCallRejected from "./socket-event/onCallRejected.js";
import onWebrtcSignal from "./socket-event/onWebrtcSignal.js";
import onHangup from "./socket-event/onHangup.js";
import pkg from "wrtc";
const { RTCPeerConnection, RTCIceCandidate } = pkg;

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
export let io;
console.log("running...");

app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.startsWith("http://localhost:3001")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    },
  });

  // io = new Server(httpServer, {
  //   cors: {
  //     origin: "http://localhost:3001", // Địa chỉ của frontend (ví dụ nếu frontend của bạn chạy trên localhost:3001)
  //     methods: ["GET", "POST"],
  //   },
  // });
  let onlineUsers = [];
  io.on("connection", (socket) => {
    socket.on("addNewUser", (clerkUser) => {
      clerkUser &&
        !onlineUsers.some((user) => user?._id === clerkUser._id) &&
        onlineUsers.push({
          userId: clerkUser._id,
          socketId: socket.id,
          profile: clerkUser,
        });

      // Gửi đến tất cả client kết nối đến
      //io.emit('an event sent to all connected clients');
      io.emit("getUsers", onlineUsers);
    });
    console.log(onlineUsers, "this is online user");
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

      io.emit("getUsers", onlineUsers);
    });

    //call event
    socket.on("call", onCall);

    socket.on("callAccepted", onCallAccepted);
    // socket.on("callAccepted", onCallRejected);
    socket.on("webrtcSignal", onWebrtcSignal);

    // Khi nhận tín hiệu offer từ client, gửi offer đến client còn lại
    socket.on("offer", (offer, to) => {
      console.log("Sending offer to: " + to);
      socket.to(to).emit("offer", offer);
    });

    // Khi nhận tín hiệu answer từ client, gửi answer đến client còn lại
    socket.on("answer", (answer, to) => {
      console.log("Sending answer to: " + to);
      socket.to(to).emit("answer", answer);
    });

    // Khi nhận tín hiệu ICE candidates từ client, gửi đến client còn lại
    socket.on("candidate", (candidate, to) => {
      console.log("Sending candidate to: " + to);
      socket.to(to).emit("candidate", candidate);
    });

    socket.on("hangup", onHangup);
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
