const express=require('express')
const router=express.Router()
const { createBoard, getBoardsForUser, getBoardById, addMemberToBoard, deleteBoard, editBoard  } =require("../controller/boardController")
const { protect, hasAdminPrivileges } =require( "../middleware/authMiddleware")
const columnRoutes=require('../routes/columnRoute')

router.post('/', protect, hasAdminPrivileges,  createBoard)

router.get('/', protect, getBoardsForUser)

router.get('/:id', getBoardById)

router.use('/:boardId/columns', columnRoutes);

router.patch('/:boardId/add-member', protect, hasAdminPrivileges, addMemberToBoard)

router.delete('/:boardId', protect, hasAdminPrivileges, deleteBoard)

router.put('/:boardId', protect, hasAdminPrivileges, editBoard)

module.exports=router;