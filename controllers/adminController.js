const Exam = require("../models/exam_model");
const User = require("../models/user_model");

const getExams= async (req,res) => {
    const {id}=req.params
    try {
      const allExams=await Exam.find({adminId:id})
      res.status(200).json({message:"All Exams",allExams})
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  
  }

  const allstudents=async (req,res) => {
    try {
        const allusers=await User.find({role:"user"},{password:0})
        res.status(200).json({message:"All Students",allusers})
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
  }

  module.exports={getExams,allstudents}