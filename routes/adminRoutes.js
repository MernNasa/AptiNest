const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/user_model");
const { createExam, updateExamStatus, cancelledExam, updateScheduleDateTime, deleteExam } = require("../controllers/examController");
const {getExams, allstudents} = require("../controllers/adminController");
const adminRouter=express.Router()


/**
 * @swagger
 * /api/admin-dashboard:
 *   get:
 *     summary: Get Admin dashboard (Admin role only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved Admin dashboard
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
 *                     role: "admin"
 *                     course: "MERN"
 *                     mobilenumber: "9988776655"
 *                     createdAt: "2025-03-25T19:28:23.936Z"
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - User does not have the required role
 *       404:
 *         description: user not found
 */
adminRouter.get('/admin-dashboard', verifyToken, authorizeRoles('admin'), async(req, res) => {
    const user = await User.findById(req.user.id,'-password')
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({user})
  });


/**
 * @swagger
 * /api/all-students:
 *   get:
 *     summary: Get all registered users (Admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65ef1e0b1f1abc1234567890"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *                   role:
 *                     type: string
 *                     example: "user"
 *                   course:
 *                     type: string
 *                     example: "MERN"
 *                   mobilenumber:
 *                     type: string
 *                     example: "9876543210"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not an admin)
 *       500:
 *         description: Internal server error
 */
adminRouter.get("/all-students",verifyToken,authorizeRoles('admin'),allstudents)
adminRouter.get("/exams/:id",verifyToken,authorizeRoles('admin'),getExams)
adminRouter.get("/update-exam-status/:examId",verifyToken,authorizeRoles('admin'),updateExamStatus)
adminRouter.get("/cancelled-exam/:examId",verifyToken,authorizeRoles('admin'),cancelledExam)
adminRouter.put("/update-dateTime/:examId",verifyToken,authorizeRoles('admin'),updateScheduleDateTime)

/**
 * @swagger
 * /api/create-exam:
 *   post:
 *     summary: Create a new exam (Admin only)
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 default: "Aptitude Exam"
 *               description:
 *                 type: string
 *                 default: "This exam tests basic aptitude skills."
 *               scheduleDateTime:
 *                 type: string
 *                 format: date-time
 *                 default: "2025-04-05T03:00:00"
 *               duration:
 *                 type: number
 *                 default: 60
 *               maxMarks:
 *                 type: number
 *                 default: 100
 *               passingMarks:
 *                 type: number
 *                 default: 40
 *               totalQuestions:
 *                 type: number
 *                 default: 20
 *               category:
 *                 type: string
 *                 default: "Aptitude"
 *     responses:
 *       201:
 *         description: Exam created successfully
 *       401:
 *         description: Unauthorized
 */
adminRouter.post("/create-exam",verifyToken,authorizeRoles('admin'),createExam)
adminRouter.delete("/delete-exam/:examId",verifyToken,authorizeRoles('admin'),deleteExam)
module.exports={adminRouter}