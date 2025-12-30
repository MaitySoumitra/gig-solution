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
// controller/taskController.js
const getTasksForColumn = async (req, res) => {
  try {
    const { boardId, columnId } = req.params;

    // Check if boardId and columnId are provided
    if (!boardId || !columnId) {
      return res.status(400).json({ message: 'boardId and columnId are required' });
    }

    const board = await Board.findById(boardId).select('members');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Ensure user is a member of the board
    if (!board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied. Not a board member' });
    }

    const tasks = await Task.find({ board: boardId, column: columnId })
      .populate('assignedTo', 'name email role')
      .populate('attachments.uploadedBy', 'name email')
      .populate('comments.user', 'name profilePicture')
      .populate('activityLog.user', 'name');

    res.status(200).json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for board ${req.params.boardId} and column ${req.params.columnId}`, error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};
const moveTask = async (req, res) => {
  const { newColumnId, newPosition } = req.body;
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldColumnId = task.column;

    // 1. Update task itself
    task.column = newColumnId;
    task.position = newPosition;
    await task.save();

    // 2. Update columns ONLY if column changed
    if (String(oldColumnId) !== String(newColumnId)) {
      await Column.findByIdAndUpdate(oldColumnId, {
        $pull: { tasks: taskId }
      });

      await Column.findByIdAndUpdate(newColumnId, {
        $push: { tasks: taskId }
      });
    }

    // 3. Reindex NEW column tasks
    const allTasksInCol = await Task.find({
      column: newColumnId,
      _id: { $ne: taskId }
    }).sort('position');

    allTasksInCol.splice(newPosition, 0, task);

    await Task.bulkWrite(
      allTasksInCol.map((t, i) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { $set: { position: i } }
        }
      }))
    );

    // 4. Reindex OLD column if needed
    if (String(oldColumnId) !== String(newColumnId)) {
      const oldColTasks = await Task.find({ column: oldColumnId }).sort('position');
      await Task.bulkWrite(
        oldColTasks.map((t, i) => ({
          updateOne: {
            filter: { _id: t._id },
            update: { $set: { position: i } }
          }
        }))
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database update failed" });
  }
};
const updateTask= async(req, res)=>{
  try{
     const { taskId}=req.params;
     const updates=req.body;
     const updatedTask=await Task.findByIdAndUpdate(
      taskId,
      {
          $set: updates
      },
      {new: true, runValidators: true}
     ).populate('assignedTo', 'name email')
     res.status(200).json(updatedTask)
  }
  catch(err){
    res.status(500).json("failed to update task")
  }
 
}

module.exports={createTask, getTasksForColumn, moveTask, updateTask}