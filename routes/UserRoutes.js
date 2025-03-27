const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/user_model");
const bcrypt=require("bcryptjs")
const userRoute=express.Router()
const jwt=require("jsonwebtoken")

userRoute.get("/user",async (req,res) => {
    res.send("user router")
})


userRoute.post("/register",async(req,res)=>{
    const {name,email,mobilenumber,course,password,role}=req.body
    const user=await User.findOne({email})
    if(user) return res.status(400).json({ message: 'User already register' });
    const result=await User.insertOne({name,email,mobilenumber,role,password,course})
    res.status(200).json({message:"User Create Successfully",id:result._id})
})

userRoute.post("/login",async (req,res) => {
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(password===user.password){
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1hr' });  
       
        res.cookie('token',token,{
            httpOnly: true,
            sameSite:'Strict',
            maxAge:3*24*60*60*1000
        })

        res.status(200).json({message:"login successfully",role:user.role})
    }
    else{
        res.status(500).json({message:"Password wrong"})
    }
})

userRoute.get('/student-dashboard', verifyToken,authorizeRoles('user') ,async(req, res) =>{
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({user})
  });
  

module.exports=userRoute