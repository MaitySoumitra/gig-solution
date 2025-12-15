const Task = require('../models/Task')
const Column = require('../models/Column')
const Board = require('../models/Board')

const createTask = async (req, res) => {
    const { boardId, columnId } = req.params;
    const { title, description, priority, assignedTo, dueDate } = req.body;
    try {
        const board = await Board.findById(boardId).select('members');
        if (!board) {
            return res.status(404).json({ mssage: 'Board not found' })
        }
        const isMember = board.members.some(member => member._id.toString() == req.user._id.toString())
        if (!isMember) {
            return res.status(403).json({ message: 'Access Denied: You must be member' })
        }
        const newTask = new Task({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            column: columnId,
            board: boardId,
            activityLog: [{
                user: req.user._id, action: `task created by ${req.user.name || 'member'}`
            }]

        })
        await newTask.save()
        await Column.findByIdAndUpdate(
            columnId,
            { $push: { task: newTask._id } },
            { new: true }
        )
        const populatedTask = await Task.findById(newTask._id)
            .populate('assignedTo', 'name email');

        res.status(201).json(populatedTask)
    }
    catch (error) {
        console.error(`Error creating task for column ${columnId}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Id format provided' })
        }
        res.status(500).json({ message: 'Server Error: Failed to create task' });
    }
}
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email role')
            .populate('attachments.uploadBy', 'name.email')
            .populate('comments.user', 'name profilePicture')
            .populate('activityLog.user', 'name');
        if (!task) {
            return res.status(404).json({ message: 'task not found' })
        }
        const board = await Board.findById(task.board).select('members');
        const isMember=board.members.some(member=>member.toString()===req.user._id.toString())
        if(!isMember){
            return res.status(403).json({message: 'Access denied. Not a board member'})
        }
        res.status(200).json(task)
    }
    catch(error){
        console.error(`Error fetching  task ${req.paramas.id}`, error)
        res.status(500).json({message: "Server error: failed to retrive task"})
    }
}
const moveTask = async(req, res)=>{
    const {newColumnId, newPostion}=req.body;
    const taskId=req.params.id;

    if(!newColumnId){
        return res.status(400).json({message: "new column id is required for movid task"})
    }
    try{
        const task= await Task.findById(taskId);
        if(!task){
            return res.status(404).json({message: "Task is not found"})
        }
        const oldColumnId=task.column;
        const board=await Board.findById(task.board).select('members');
        const isMember = board.members.some(member=>member.toString()===req.user._id.toString())

        if(!isMember){
            return res.status(403).json({message: 'Access Denied . Not a board member'})
        }
        await Column.findByIdAndUpdate(
            oldColumnId,
            {$pull:{task: taskId}}
        )
        await Column.findByIdAndUpdate(
            newColumnId,
            {$push: {task:taskId}}
        )
        task.column=newColumnId;
        task.activityLog.push({
            user:req.user._id, 
            action:`Move task from column ${oldColumnId} to ${newColumnId}`
        })
        await task.save()
        res.status(200).json({message: 'Task moved successfully!', taskId})
       
    }
    catch(error){
        console.error(`Error moving task ${taskId}:`, error)
        res.status(500).json({message:"Server Error: failed to move task."})
    }
}

module.exports={createTask, getTaskById, moveTask}