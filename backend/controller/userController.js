const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt= require('jsonwebtoken')

const MAX_AGE_MS=3*24*60*60*1000

const cookieOptions={
    httpOnly: true,
    maxAge: MAX_AGE_MS,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
}

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
        let redirectTo='/dashboard'
        if(user.role==='super-admin'){
            redirectTo='/super-admin/dashboard';
        }
        else if(user.role==='admin'){
            redirectTo='/admin/dashboard';           
        }
       
       
        res.status(200).json({
            message: 'Login success',
            user:{id:user._id, name:user.name, role: user.role},
            redirectTo
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

const searchUsers = async (req, res) => {
    // 1. Get the search query from the request, typically via query parameters (?query=...)
    const { query } = req.query; 

    if (!query || query.length < 2) {
        // Require a minimum length for the search query to prevent massive database lookups
        return res.status(400).json({ message: 'Search query must be at least 2 characters long.' });
    }

    try {
        // 2. Define the search criteria
        const searchCriteria = {
            // $or operator allows searching across multiple fields
            $or: [
                // $regex performs pattern matching for substring search
                // $options: 'i' makes the search case-insensitive
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };

        // 3. Execute the search
        const users = await User.find(searchCriteria)
            .select('_id name email role profilepicture') // Only return necessary fields
            .limit(10); // Limit results to 10 for performance

        // 4. Send the found users back to the frontend
        res.status(200).json(users);

    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ message: 'Server error: Failed to search for users.' });
    }
};

module.exports={
    loginUser,
    logoutUser,
    registerUser,
    getProfile,
    searchUsers
}