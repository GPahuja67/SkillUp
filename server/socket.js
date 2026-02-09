const { Server } = require("socket.io");

const socketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // Join a room
    socket.on("joinRoom", (room) => {
      if (!room) return;
      socket.join(room);
      console.log(`📥 ${socket.id} joined room: ${room}`);
    });

    // Receive & broadcast message
    socket.on("sendMessage", (data) => {
      if (!data || !data.room || !data.message) return;

      console.log("📨 Message:", data);

      io.to(data.room).emit("receiveMessage", {
        sender: data.sender,
        message: data.message,
        room: data.room
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};

module.exports = socketIO;
