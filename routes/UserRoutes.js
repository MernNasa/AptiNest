const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/user_model");
const userRoute=express.Router()


userRoute.get("/user",async (req,res) => {
    res.send("user router")
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
  

module.exports=userRoute