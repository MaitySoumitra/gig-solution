const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const ChatRequest = require("../models/ChatRequest");


/* 🔍 SEARCH USERS */
exports.searchUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
      name: { $regex: req.query.q, $options: "i" },
    }).select("name email role");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 💬 ACCESS CHAT */
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  // ✅ check accepted request exists
  const allowed = await ChatRequest.findOne({
    status: "accepted",
    $or: [
      { from: req.user.id, to: userId },
      { from: userId, to: req.user.id },
    ],
  });

  if (!allowed) {
    return res.status(403).json({
      message: "Chat request not accepted yet",
    });
  }

  let chat = await Conversation.findOne({
    members: { $all: [req.user.id, userId] },
  });

  if (!chat) {
    chat = await Conversation.create({
      members: [req.user.id, userId],
    });
  }

  res.json(chat);
};
;

/* 📩 SEND MESSAGE */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      text: text || "",
    });

    if (req.file) {
      message.file = {
        name: req.file.originalname,
        url: `/uploads/chat/${req.file.filename}`,
        type: req.file.mimetype,
        size: req.file.size,
      };
      await message.save();
    }

    // ✅ update conversation timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date(),
    });

    // 🔔 SOCKET EMIT
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId.toString()).emit("new-message", {
        _id: message._id,
        conversationId,
        senderId: req.user.id,
        senderName: req.user.name,
        text: message.text,
        file: message.file || null,
        createdAt: message.createdAt,
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Message send failed" });
  }
};


/* 📜 GET MESSAGES */
exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    conversationId: req.params.id,
  }).populate("sender", "name");

  res.json(messages);
};

/* 📌 GET MY CHATS (PINNED CHATS) */
exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Conversation.find({
      members: userId,
    })
      .populate("members", "name email")
      .sort({ updatedAt: -1 });

    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          conversationId: chat._id,
          sender: { $ne: userId },
          seen: false,
        });

        return {
          ...chat.toObject(),
          unreadCount,
        };
      })
    );

    res.json(chatsWithUnread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.markMessagesSeen = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user.id },
        seen: false,
      },
      { $set: { seen: true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark seen" });
  }
};



