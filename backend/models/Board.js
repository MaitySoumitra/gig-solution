const mongoose =require('mongoose')
const {Schema} =require('mongoose')
const User =require('../models/User')

const BoardSchema = new Schema({
    name: {type: String, required: true},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    columns:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column'
    }]
}, {timestamps: true})

// --- Inside models/Board.js ---

BoardSchema.post('save', async function (doc) {
    // Only run if we have a user context (the person who made the change)
    if (!doc._userContext) return;

    try {
        const Notification = mongoose.model('Notification');
        const User = mongoose.model('User');

        // Check if members were added
        // Note: This logic assumes you've set _userContext in the controller
        const actionText = `Add Member to the Board `;

        await Notification.create({
            board: doc._id,
            sender: doc._userContext,
            action: actionText,
            readBy: [doc._userContext]
        });

        console.log("Board Notification automatically created via Hook.");
    } catch (err) {
        console.error("Board Hook Notification Error:", err.message);
    }
});

module.exports=mongoose.model('Board', BoardSchema)