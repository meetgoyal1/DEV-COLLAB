const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");

// Track online users per room: { roomId: { userId: socketId } }
const onlineUsers = {};
// Track editor state per room: { roomId: { code, language } }
const editorState = {}; 

const socketHandler = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select("-password -refreshToken");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.username}`);

    // ── JOIN ROOM ──────────────────────────────────────────
    socket.on("join-room", async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        const isMember = room.members.some(
          (m) => m.toString() === socket.user._id.toString()
        );
        if (!isMember) return;

        socket.join(roomId);

        // Track online users
        if (!onlineUsers[roomId]) onlineUsers[roomId] = {};
        onlineUsers[roomId][socket.user._id.toString()] = {
          socketId: socket.id,
          user: {
            _id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar,
          },
        };

        // Tell everyone in room who is online
        io.to(roomId).emit("online-users", {
          users: Object.values(onlineUsers[roomId]).map((u) => u.user),
        });
        // Send current editor state to the joining user
        if (editorState[roomId]) {
          socket.emit("editor-init", editorState[roomId]);
        }
        // Send system message — user joined
        const systemMsg = await Message.create({
          room: roomId,
          sender: socket.user._id,
          type: "system",
          content: `${socket.user.username} joined the room`,
        });

        const populated = await systemMsg.populate("sender", "username avatar");
        io.to(roomId).emit("new-message", populated);

        console.log(`${socket.user.username} joined room ${roomId}`);
      } catch (err) {
        console.error("join-room error:", err.message);
      }
    });

    // ── SEND MESSAGE ───────────────────────────────────────
    socket.on("send-message", async ({ roomId, content, type, fileUrl, fileName, language }) => {
      try {
        if (!content && !fileUrl) return;

        const room = await Room.findById(roomId);
        if (!room || !room.isActive) return;

        const isMember = room.members.some(
          (m) => String(m) === String(socket.user._id),
        );
        if (!isMember) return;

        const message = await Message.create({
          room: roomId,
          sender: socket.user._id,
          type: type || "text",
          content: content || "",
          fileUrl: fileUrl || "",
          fileName: fileName || "",
          language: language || "javascript",
        });

        const populated = await message.populate("sender", "username avatar");
        io.to(roomId).emit("new-message", populated);
      } catch (err) {
        console.error("send-message error:", err.message);
      }
    });

    // ── TYPING INDICATOR ───────────────────────────────────
    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("user-typing", {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    socket.on("stop-typing", ({ roomId }) => {
      socket.to(roomId).emit("user-stop-typing", {
        userId: socket.user._id,
      });
    });

    //EDITOR SYNC
    socket.on("editor-change",({roomId,code,language}) => {
      //save latest state memory
      editorState[roomId] = {code, language};
      //boradcast 
      socket.to(roomId).emit("editor-update",{ code, language });
    });
    socket.on("editor-language-change",({ roomId, language }) => {
      if(editorState[roomId]){
        editorState[roomId].language = language;
      }
      else{
        editorState[roomId] = { code: "", language};
      }
      socket.to(roomId).emit("editor-language-update", { language });
    });
    socket.on("editor-cursor" , ({roomId , cursor }) => {
      socket.to(roomId).emit("editor-cursor-update" , {
        userId : socket.user._id.toString(),
        username : socket.user.username,
        cursor
      });
    });



    // ── LEAVE ROOM ─────────────────────────────────────────
    socket.on("leave-room", async ({ roomId }) => {
      await handleLeaveRoom(socket, io, roomId);
    });

    // ── DISCONNECT ─────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.user.username}`);

      // Remove from all rooms they were in
      for (const roomId of Object.keys(onlineUsers)) {
        if (onlineUsers[roomId][socket.user._id.toString()]) {
          await handleLeaveRoom(socket, io, roomId);
        }
      }
    });
  });
};

// Helper — handle leaving a room
async function handleLeaveRoom(socket, io, roomId) {
  try {
    socket.leave(roomId);

    if (onlineUsers[roomId]) {
      delete onlineUsers[roomId][socket.user._id.toString()];

      if (Object.keys(onlineUsers[roomId]).length === 0) {
        delete onlineUsers[roomId];
      } else {
        io.to(roomId).emit("online-users", {
          users: Object.values(onlineUsers[roomId]).map((u) => u.user),
        });
      }
    }

    // System message — user left
    const systemMsg = await Message.create({
      room: roomId,
      sender: socket.user._id,
      type: "system",
      content: `${socket.user.username} left the room`,
    });

    const populated = await systemMsg.populate("sender", "username avatar");
    io.to(roomId).emit("new-message", populated);
  } catch (err) {
    console.error("leave-room error:", err.message);
  }
}

module.exports = socketHandler;