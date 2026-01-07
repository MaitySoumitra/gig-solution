// routes/taskRoutes.js

const express = require('express');
const router = express.Router(); 
const { getTasksForColumn, moveTask,createTask, updateTask, deleteTask } = require('../controller/taskController');
const { protect } = require('../middleware/authMiddleware');

// Route to get and update a single task

router.patch('/:taskId/move', protect, moveTask);
// Add other routes like PUT /:id (edit details), POST /:id/comments, etc., here later.
router.patch("/:taskId", updateTask)
router.delete("/:taskId", protect, deleteTask)
module.exports = router;