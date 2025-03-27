const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/user_model");
const adminRouter=express.Router()
adminRouter.get('/admin-dashboard', verifyToken, authorizeRoles('admin'), async(req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({user})
  });

module.exports={adminRouter}