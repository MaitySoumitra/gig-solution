// routes/taskRoutes.js

const express = require('express');
const router = express.Router(); 
const { getTasksForColumn, moveTask,createTask, updateTask, deleteTask, addTaskComment, updateTaskProgress, getAllUserTasks } = require('../controller/taskController');
const { protect } = require('../middleware/authMiddleware');

router.patch('/:taskId/move', protect, moveTask);
router.patch("/:taskId", protect, updateTask)
router.delete("/:taskId", protect, deleteTask)
router.patch("/:taskId/progress", protect, updateTaskProgress)
router.post('/:taskId/comments', protect, addTaskComment)
router.get('/', protect, getAllUserTasks);
module.exports = router;