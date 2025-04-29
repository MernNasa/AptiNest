const express=require("express");
const User = require("../models/user_model");
const sendEmail = require("../config/email");
const jwt=require("jsonwebtoken");
const { verifyToken } = require("../middleware/authMiddleware");
const { liveExams, allExams, attendExam } = require("../controllers/examController");
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

        res.status(200).json({message:"login successfully",role:user.role,id:user._id})
    }
    else{
        res.status(500).json({message:"Password wrong"})
    }
})
/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout the user
 *     description: Clears the authentication token from cookies and logs out the user.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
publicRoute.post("/logout", (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Strict',
      secure: false // set to true if using HTTPS in production
    });
  
    res.status(200).json({ message: "Logout successful" });
  });
  

//! live exams

publicRoute.get("/live-exams",verifyToken,liveExams)

//! all-exams

publicRoute.get("/all-exams",verifyToken,allExams)

/**
 * @swagger
 * /api/attend-exam:
 *   post:
 *     summary: Attend an exam
 *     description: |
 *       This endpoint checks if the user is registered and if the exam is currently ongoing. 
 *       If valid, it returns all related questions to the user.
 *     tags:
 *       - Attend Exams
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *             properties:
 *               examId:
 *                 type: string
 *                 description: ID of the exam to attend
 *                 example: "6611e3f1f77b4e3a4c8e6d51"
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       400:
 *         description: Missing examId or userId in request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: examId and userId are required
 *       403:
 *         description: User not registered or exam is not ongoing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You need to register before attending the exam
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
publicRoute.post("/attend-exam",verifyToken,attendExam)

publicRoute.get("/findme",verifyToken,async (req,res) => {
    const userId=req.user.id
    try {
        const userdetails=await User.findById(userId)
        if(userdetails){
            return res.status(200).json({userdetails})
        }
        else{
            return res.status(404).json({message:"user not found"})
        }
    } catch (error) {
        
    }
})
module.exports=publicRoute