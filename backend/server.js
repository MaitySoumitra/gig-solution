const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());

app.use(
  cors({
    origin:process.env.CORS_URL, // your frontend port
    credentials: true,
  })
);

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err)
  );

/* ================= CREATE SERVER + SOCKET ================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const socketHandler = require("./socket");
socketHandler(io);

/* ================= ROUTES ================= */
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/boards", require("./routes/boardRoute"));
app.use("/api/column", require("./routes/columnRoute"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./routes/notificationRoute"));
app.use("/api/chat", require("./routes/chatRoute"));
app.use("/api/chat-request", require("./routes/chatRequestRoute"));

/* ================= DEFAULT ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🚀 Backend & Socket Server Running");
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  res.status(400).json({ message: err.message });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});
