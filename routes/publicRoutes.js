const express=require("express");
const User = require("../models/user_model");
const sendEmail = require("../config/email");
const jwt=require("jsonwebtoken");
const { verifyToken } = require("../middleware/authMiddleware");
const { liveExams, allExams } = require("../controllers/examController");
const publicRoute=express.Router()


//! Registration

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - course
 *               - mobilenumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               course:
 *                 type: string
 *                 example: "MERN"
 *               mobilenumber:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request or user already exists
 *       500:
 *         description: Internal server error
 */

publicRoute.post("/register",async(req,res)=>{
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

//! login
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user and return token in cookies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 default: "admin@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 default: "admin123"
 *     responses:
 *       200:
 *         description: Login successful, token set in cookies
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */


publicRoute.post("/login",async (req,res) => {
    console.log("login")
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(password===user.password){
        const token = jwt.sign({ id: user._id, role: user.role ,name:user.name}, process.env.JWT_SECRET, { expiresIn: '1hr' });  
        res.cookie('token',token,{
            httpOnly: true,
            sameSite:'Strict',
            secure: false ,
            maxAge:3*24*60*60*1000
        })

        res.status(200).json({message:"login successfully",role:user.role})
    }
    else{
        res.status(500).json({message:"Password wrong"})
    }
})


//! live exams

publicRoute.get("/live-exams",verifyToken,liveExams)

//! all-exams

publicRoute.get("/all-exams",verifyToken,allExams)
module.exports=publicRoute