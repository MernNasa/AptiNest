const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/user_model");
const { examsubmit, userresult, examResponse } = require("../controllers/examController");
const userRoute=express.Router()


userRoute.get("/user",async (req,res) => {
    res.send("user router")
})
userRoute.get("/demo",(req,res)=>{
    res.status(200).json({message:"you finally done with the project 😁😁"})
})

userRoute.get("/demo2",(req,res)=>{
    res.status(200).json({message:"you finally done with the live testing also 😁😁"})
})

/**
 * @swagger
 * /api/student-dashboard:
 *   get:
 *     summary: Get student dashboard (User role only)
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved student dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   example:
 *                     _id: "65ef1e0b1f1abc1234567890"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                     role: "user"
 *                     course: "MERN"
 *                     mobilenumber: "9988776655"
 *                     createdAt: "2025-03-25T19:28:23.936Z"
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - User does not have the required role
 *       404:
 *         description: User not found
 */

userRoute.get('/student-dashboard', verifyToken,authorizeRoles('user') ,async(req, res) =>{
    const user = await User.findById(req.user.id,'-password')
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({user})
  });

  /**
 * @swagger
 * /api/submit-exam:
 *   post:
 *     summary: Submit an exam
 *     tags:
 *       - Exam
 *     description: Requires authentication via cookies. Make sure the user is logged in.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - answers
 *             properties:
 *               examId:
 *                 type: string
 *                 example: "661dd5041e4f1b9c5f7353ac"
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       example: "661dd5181e4f1b9c5f7353ad"
 *                     selectedOption:
 *                       type: string
 *                       example: "B"
 *     responses:
 *       201:
 *         description: Exam submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam Submitted successfully
 *       400:
 *         description: Missing or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing or invalid data
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Error message here
 */
userRoute.post("/submit-exam",verifyToken,authorizeRoles('user'),examsubmit)
/**
 * @swagger
 * /api/exam-result/{examId}:
 *   get:
 *     summary: Get a user's result for a specific exam
 *     tags:
 *       - Results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         description: ID of the exam
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched Results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched Results
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Result'
 *       401:
 *         description: Unauthorized - JWT required
 *       500:
 *         description: Server error
 */
userRoute.get("/exam-result/:examId",verifyToken,authorizeRoles('user'),userresult)

/**
 * @swagger
 * /api/exam-response/{examId}:
 *   get:
 *     summary: Get the exam response of a user for a specific exam
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         description: ID of the exam
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched Response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched Response
 *                 examId:
 *                   type: string
 *                   example: 67f0cbbf1ee2482186c42d65
 *                 examresponse:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserAnswer'
 *       401:
 *         description: Unauthorized - JWT required
 *       500:
 *         description: Server error
 */
userRoute.get("/exam-response/:examId",verifyToken,authorizeRoles('user'),examResponse)
module.exports=userRoute