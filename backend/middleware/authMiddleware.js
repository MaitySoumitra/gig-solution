const jwt = require('jsonwebtoken')
const User =require('../models/User')

const protect= async (req, res, next)=>{
    let token;

    if(req.cookies.authToken){
        token=req.cookies.authToken;
    }
    if(!token){
        return res.status(401).json({message: "Authentication required"})
    }
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET)
        req.user= await User.findById(decoded.id).select('-password')
        if (!req.user) {
             return res.status(401).json({ message: 'User not found' });
        }
        next();
    }catch(error){
       console.error('Auth token error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
}


// 2. hasAdminPrivileges: Allows EITHER 'super-admin' OR 'admin'. (For shared routes like board creation)
const hasAdminPrivileges = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
        console.log("User role:", req.user?.role);

        next();
    } else {
        res.status(403).json({ message: "Access denied: Admin privileges required" });
    }
};

// NOTE: The original 'admin' middleware remains valid for routes only admins can access.
// You will export all of these.
module.exports = { protect,  hasAdminPrivileges };
