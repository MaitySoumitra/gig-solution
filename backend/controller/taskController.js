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
    // 1. Find the task and update its column/position immediately
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldColumnId = task.column;
    
    // Update the specific task first
    task.column = newColumnId;
    task.position = newPosition;
    await task.save();

    // 2. Fetch all other tasks in that NEW column to re-index them
    const allTasksInCol = await Task.find({ 
      column: newColumnId, 
      _id: { $ne: taskId } 
    }).sort('position');

    // Insert the moved task into the array at the target position
    allTasksInCol.splice(newPosition, 0, task);

    // 3. Prepare bulk update to ensure EVERY task has a sequential position (0, 1, 2...)
    const updateOps = allTasksInCol.map((t, i) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { position: i } },
      }
    }));

    await Task.bulkWrite(updateOps);

    // 4. OPTIONAL: If moved from a different column, re-index the OLD column to close the gap
    if (String(oldColumnId) !== String(newColumnId)) {
       const oldColTasks = await Task.find({ column: oldColumnId }).sort('position');
       const oldOps = oldColTasks.map((t, i) => ({
         updateOne: { filter: { _id: t._id }, update: { $set: { position: i } } }
       }));
       if (oldOps.length > 0) await Task.bulkWrite(oldOps);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database update failed" });
  }
};

module.exports={createTask, getTasksForColumn, moveTask}