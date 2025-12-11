const express=require('express')
const router = express.Router();
const userController=require('../controller/userController');
const {protect, hasAdminPrivileges }=require('../middleware/authMiddleware')


router.post('/login', userController.loginUser)

router.post('/logout', userController.logoutUser)

router.post('/register', protect, hasAdminPrivileges, userController.registerUser)

router.get('/profile', protect, userController.getProfile)

router.get('/search', protect, userController.searchUsers);

module.exports= router