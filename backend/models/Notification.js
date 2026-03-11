const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const notificationSchema = new Schema({
    // REMOVE recipient: { type: Schema.Types.ObjectId, ... }
    
    board: { 
        type: Schema.Types.ObjectId, 
        ref: 'Board', 
        required: true 
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    task: { 
        type: Schema.Types.ObjectId, 
        ref: 'Task' 
    },
    action: { 
        type: String, 
        required: true 
    },
    // We use an array of user IDs who have read it, rather than a single boolean
    readBy: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { timestamps: true });

notificationSchema.index({ board: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);