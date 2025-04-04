const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/user_model");
const bcrypt=require("bcryptjs")
const userRoute=express.Router()
const jwt=require("jsonwebtoken");
const sendEmail = require("../config/email");

userRoute.get("/user",async (req,res) => {
    res.send("user router")
})


userRoute.post("/register",async(req,res)=>{
    const {name,email,mobilenumber,course,password,role}=req.body
    const text=`Subject: Welcome to AptiNest Coding Platform 🎉

Hi ${name},

Thank you for joining AptiNest Coding Platform! We’re excited to have you on board.

Here’s what you can do next:
✅ Explore our features
✅ Update your profile
✅ Start using our services

If you have any questions, feel free to reply to this email.  

Best regards,  
CEO (founder) 
MERN NASA 
mernnasa@gmail.com `

    const user=await User.findOne({email})
    if(user) return res.status(400).json({ message: 'User already register' });
    const emailSent = await sendEmail(email,"Successfull Registration", text)
    if(!emailSent){
        return res.status(400).json({ message: 'User already register' });
    }
    else{
        const result=await User.insertOne({name,email,mobilenumber,role,password,course})
        res.status(200).json({message:"User Create Successfully",id:result._id})
    }
    
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