const mongoose = require("mongoose");
const User = require("./models/User");
 
module.exports = function socketHandler(io) {
  const onlineUsers = new Map(); // userId -> socketId
 
  io.on("connection", async (socket) => {
    console.log("🟢 Connected:", socket.id);
 
    /* ================= SEND ALL STATUS ON CONNECT ================= */
    try {
      const users = await User.find().select("_id status");
 
      socket.emit(
        "all-status",
        users.map((user) => ({
          userId: user._id.toString(),
          status: user.status || null,
        }))
      );
    } catch (err) {
      console.error("❌ Error sending all statuses:", err);
    }
 
    /* ================= GET ALL STATUS (FOR REFRESH) ================= */
    socket.on("get-all-status", async () => {
      try {
        const users = await User.find().select("_id status");
 
        socket.emit(
          "all-status",
          users.map((user) => ({
            userId: user._id.toString(),
            status: user.status || null,
          }))
        );
      } catch (err) {
        console.error("❌ Error sending all statuses:", err);
      }
    });
 
    /* ================= USER SETUP ================= */
    socket.on("setup", (userId) => {
      try {
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
 
        io.emit("online-users", Array.from(onlineUsers.keys()));
      } catch (err) {
        console.error("❌ Setup error:", err);
      }
    });
 
    /* ================= USER STATUS (DB PERSISTENT) ================= */
    socket.on("set-status", async ({ userId, status }) => {
      console.log("📌 Status update:", userId, status);
 
      try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.log("❌ Invalid userId");
          return;
        }
 
        await User.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { status: status || null } }
        );
 
        console.log("✅ Status saved to DB");
 
        io.emit("status-updated", {
          userId,
          status,
        });
      } catch (err) {
        console.error("❌ Status update error:", err);
      }
    });
 
    /* ================= AUDIO CALL ================= */
 
    socket.on("call-user", ({ to, offer }) => {
      const targetSocket = onlineUsers.get(to);
      if (!targetSocket) return;
 
      io.to(targetSocket).emit("incoming-call", {
        fromUserId: socket.userId,
        fromSocketId: socket.id,
        offer,
      });
    });
 
    socket.on("answer-call", ({ toSocketId, answer }) => {
      io.to(toSocketId).emit("call-accepted", { answer });
    });
 
    socket.on("ice-candidate", ({ toSocketId, candidate }) => {
      io.to(toSocketId).emit("ice-candidate", candidate);
    });
 
    socket.on("end-call", ({ toUserId }) => {
      const targetSocket = onlineUsers.get(toUserId);
      if (targetSocket) {
        io.to(targetSocket).emit("call-ended");
      }
    });
 
    /* ================= DISCONNECT ================= */
    socket.on("disconnect", async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
 
        io.emit("online-users", Array.from(onlineUsers.keys()));
      }
 
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};
 