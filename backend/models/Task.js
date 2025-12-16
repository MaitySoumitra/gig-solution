const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const commentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    text:{
        type:String,
        
    }
}, {timestamps: true});

const activitySchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action:{
        type: String,
        
    }
}, {timestamps:true});

const TaskSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description: { type: String},
    priority:{
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    dueDate: Date,
    startDate: Date,
    assignedTo:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    column:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column',
        required: true
    },
    board:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    subtasks:[{
        title:String,
        isCompleted:{
            type:Boolean,
            default: false
        }
    }],
    attachments:[{
        fileName: String,
        fileUrl: String,
        uploadedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    comments:[commentSchema],
    activityLog:[activitySchema],
    labels:[{
        name:String,
        color:String
    }]
}, {timestamps:true})

module.exports=mongoose.model('Task', TaskSchema)