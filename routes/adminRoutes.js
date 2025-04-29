const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/user_model");
const { createExam, updateExamStatus, cancelledExam, updateScheduleDateTime, deleteExam, addquestions, examQuestion, updateQuestion, deleteQuestion, resultsCalculation } = require("../controllers/examController");
const {getExams, allstudents, deleteUser} = require("../controllers/adminController");
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
 *     security:
 *       - bearerAuth: []
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

adminRouter.delete("/user/:userId",verifyToken,authorizeRoles('admin'),deleteUser)


/**
 * @swagger
 * /api/create-exam:
 *   post:
 *     summary: Create a new exam (Admin only)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
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




/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all exams created by a specific admin
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all exams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All Exams
 *                 allExams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Internal server error
 */
adminRouter.get("/exams",verifyToken,authorizeRoles('admin'),getExams)


/**
 * @swagger
 * /api/update-exam-status/{examId}:
 *   get:
 *     summary: Update the status of an exam based on current time (Admin only)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         description: The ID of the exam to update
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam status updated
 *                 exam:
 *                   $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Cannot update status due to timing or cancellation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot update status before scheduled date/time
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
adminRouter.get("/update-exam-status/:examId",verifyToken,authorizeRoles('admin'),updateExamStatus)

/**
 * @swagger
 * /api/cancelled-exam/{examId}:
 *   get:
 *     summary: Cancel an exam (Admin only)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         description: The ID of the exam to cancel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam Cancelled successfully
 *                 exam:
 *                   $ref: '#/components/schemas/Exam'
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
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
adminRouter.get("/cancelled-exam/:examId",verifyToken,authorizeRoles('admin'),cancelledExam)

/**
 * @swagger
 * /api/update-schedule/{examId}:
 *   put:
 *     summary: Update the scheduled date and time of an exam (Admin only)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         description: The ID of the exam to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newScheduleDateTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-10T09:30:00"
 *     responses:
 *       200:
 *         description: Exam schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam schedule updated successfully
 *                 updatedExam:
 *                   $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Schedule date and time is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule date and time is required
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
adminRouter.put("/update-dateTime/:examId",verifyToken,authorizeRoles('admin'),updateScheduleDateTime)

/**
 * @swagger
 * /api/delete-exam/{examId}:
 *   delete:
 *     summary: Delete an exam by ID (Admin only)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         description: The ID of the exam to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam deleted successfully
 *                 deletedExam:
 *                   $ref: '#/components/schemas/Exam'
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
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
adminRouter.delete("/delete-exam/:examId",verifyToken,authorizeRoles('admin'),deleteExam)


/**
 * @swagger
 * /api/add-questions:
 *   post:
 *     summary: Add multiple questions to an exam
 *     description: Adds a list of validated questions to the specified exam using its examId.
 *     tags:
 *       - Questions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - questions
 *             properties:
 *               examId:
 *                 type: string
 *                 description: MongoDB ObjectId of the exam
 *                 example: "6611e3f1f77b4e3a4c8e6d51"
 *               questions:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionText
 *                     - options
 *                     - correctAnswer
 *                     - marks
 *                     - difficultyLevel
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       example: "What is the capital of India?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       minItems: 4
 *                       maxItems: 4
 *                       example: ["Delhi", "Mumbai", "Chennai", "Kolkata"]
 *                     correctAnswer:
 *                       type: string
 *                       example: "Delhi"
 *                     marks:
 *                       type: number
 *                       example: 1
 *                     difficultyLevel:
 *                       type: string
 *                       enum: [Easy, Medium, Hard]
 *                       example: "Easy"
 *     responses:
 *       201:
 *         description: Questions added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions added successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     
 *       400:
 *         description: Bad request (validation or input issue)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 error:
 *                   type: string
 *                   example: Correct answer must be one of the options
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
 */
adminRouter.post("/add-questions",verifyToken,authorizeRoles('admin'),addquestions)


/**
 * @swagger
 * /api/getquestion/{examId}:
 *   get:
 *     summary: Get all questions for a specific exam
 *     description: Returns all questions associated with the given examId.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the exam to fetch questions for
 *         example: 6611e3f1f77b4e3a4c8e6d51
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
 *                     
 *       400:
 *         description: Missing examId in path
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ExamId is required
 *       404:
 *         description: Exam not found with the given ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam is Not Found
 *       500:
 *         description: Internal server error occurred while fetching questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
adminRouter.get("/getquestion/:examId",verifyToken,authorizeRoles('admin'),examQuestion)

/**
 * @swagger
 * /api/update-questions/{questionId}:
 *   put:
 *     summary: Update an existing question by ID
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the question to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Option A", "Option B", "Option C", "Option D"]
 *               correctAnswer:
 *                 type: string
 *               marks:
 *                 type: number
 *               difficultyLevel:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
adminRouter.put("/update-questions/:questionId",verifyToken,authorizeRoles('admin'),updateQuestion)

/**
 * @swagger
 * /api/delete-question/{questionId}:
 *   delete:
 *     summary: Delete a question by ID
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question to delete
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question deleted successfully
 *                 data:
 *                   
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found
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
adminRouter.delete("/delete-question/:questionId",verifyToken,authorizeRoles('admin'),deleteQuestion)

/**
 * @swagger
 * /api/calculate-results/{examId}:
 *   get:
 *     summary: Fetch all questions related to a specific exam
 *     description: This endpoint fetches all the questions related to the specified exam.
 *     tags:
 *       - Results
 *     parameters:
 *       - name: examId
 *         in: path
 *         description: The ID of the exam to fetch questions for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched all questions for the exam.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionId:
 *                   type: string
 *                   description: The ID of the question
 *                 questionText:
 *                   type: string
 *                   description: The text of the question
 *                 options:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The options for the question
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
adminRouter.get("/calculate-results/:examId",verifyToken,authorizeRoles('admin'),resultsCalculation)
module.exports={adminRouter}