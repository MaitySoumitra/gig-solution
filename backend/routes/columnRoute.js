const express=require('express')

const router=express.Router({mergeParams: true})

const {createColumn, deleteColumn,getColumns}= require('../controller/columnController')
const {protect} =require('../middleware/authMiddleware')
const { createTask, getTasksForColumn,  } = require('../controller/taskController')
const taskRoute=require("./taskRoutes")

router.post('/create', protect, createColumn)
router.get('/', getColumns)
router.post('/:columnId/tasks', protect, createTask)
router.get('/:columnId', protect, getTasksForColumn);
router.delete('/:columnId', protect, deleteColumn)


module.exports= router;