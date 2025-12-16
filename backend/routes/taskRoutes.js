// routes/taskRoutes.js

const express = require('express');
const router = express.Router({mergeParams:true }); 
const { getTasksForColumn, moveTask,createTask } = require('../controller/taskController');
const { protect } = require('../middleware/authMiddleware');

// Route to get and update a single task
router.post('/tasks', protect, createTask)
router.get('/', protect, getTasksForColumn);
router.put('/move', protect, moveTask);
// Add other routes like PUT /:id (edit details), POST /:id/comments, etc., here later.

module.exports = router;