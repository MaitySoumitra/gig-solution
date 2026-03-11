const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt= require('jsonwebtoken')

const MAX_AGE_MS=3*24*60*60*1000
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    maxAge: MAX_AGE_MS,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
};



const registerUser= async (req, res)=>{
    const {name, email, password, role, phone}=req.body;
    const creatingRole=req.user.role;
    if(role==='super-admin'){
        return res.status(403).json({message:'Super Admin accounts are created via database seeding only.'})
    }
    if(creatingRole==='admin' && role === 'admin'){
        return res.status(403).json({message:'Standard Admins cannot create other Admin accounts.'})
    }
    try{
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exists with this email'})
        }
        const newUser = new User({name, email, password, role, phone})
        await newUser.save()

        res.status(201).json({
            message: `User ${newUser.name} cretated successfully by admin`,
            user:{
                id:newUser._id,
                name:newUser.name,
                role:newUser.role,
            }
        })
    }
    catch(error){
        console.error('error creating User', error);
        res.status(500).json({message: 'Internal server error'})
    }
}

const loginUser= async(req, res)=>{
    try{
        const {email, password}=req.body;
        const user =await User.findOne({email});
        if(!user) return res.status(401).json({message: 'Invalid credentials'});
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({message:'Invalid credentials'})
        const token=user.generateJWT()
        res.cookie('authToken', token, cookieOptions);
        res.status(200).json({
            message: 'Login success',
            user:{id:user._id, name:user.name, role: user.role},
            
        })
    }
    catch(error){
        console.error('Login error', error);
        res.status(500).json({message: 'server error'})
    }
}

const logoutUser=(req, res)=>{
    res.clearCookie('authToken', cookieOptions);
    res.status(200).json({message: 'Logout successfully'})
}

const getProfile = (req,res)=>{
    res.json({
        message: 'profile data',
        user: req.user
    })
}

const searchUsers=async(req, res)=>{
    const {query, boardId}=req.query
    if(!query || query.length<2){
        return res.status(400).json({message: "search field require atleast two character"})
    }
    try{
        let search={
            $or: [
                {name:{$regex: query, $options: 'i'}},
                {email:{$regex: query, $options: 'i'}}
            ]
        }
        if(boardId){
            const board=await Board.findById(boardId)
            if(!board){
                return res.status(404).json({message: "Board not found"})
            }
            search._id= {$in: board.members}
            

        }
        const users=await User.find(search)
        .select('_id name email role')
        .limit(10)
        .lean()
        res.status(200).json(users)
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email role phone status profilePicture createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};




const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;
    user.phone = phone ?? user.phone;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

module.exports={
    loginUser,
    logoutUser,
    registerUser,
    getProfile,
    searchUsers,
    getAllUsers,
    updateUser,
    deleteUser
}