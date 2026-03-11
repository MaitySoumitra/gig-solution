const mongoose = require('mongoose'); // 💡 MISSING THIS?
const Notification = require('../models/Notification');
const Board = require('../models/Board');
// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
    try {
        // 1. Find all boards the user is a member of
        const Board = mongoose.model('Board');
        const userBoards = await Board.find({ members: req.user._id }).select('_id');
        const boardIds = userBoards.map(b => b._id);

        // 2. Find all notifications linked to those boards
        const notifications = await Notification.find({ 
            board: { $in: boardIds },
        })
        .populate('sender', 'name email')
        .populate('task', 'title')
        .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark a specific notification as read
// --- In controllers/notificationController.js ---

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // 💡 FIX: Add the user ID to the readBy array instead of setting isRead: true
        await Notification.findByIdAndUpdate(id, {
            $addToSet: { readBy: userId } // $addToSet ensures no duplicates
        });
        
        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- In controllers/notificationController.js ---

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // 1. Find all boards the user belongs to
        const Board = mongoose.model('Board');
        const userBoards = await Board.find({ members: userId }).select('_id');
        const boardIds = userBoards.map(b => b._id);

        // 2. 💡 FIX: Update all notifications in these boards where user is not in readBy
        await Notification.updateMany(
            { 
                board: { $in: boardIds },
                readBy: { $ne: userId } // User hasn't read it yet
            },
            { 
                $addToSet: { readBy: userId } // Mark as read
            }
        );
        
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };