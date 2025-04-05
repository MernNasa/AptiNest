const Exam = require("../models/exam_model");


//! Create Exam 


const createExam = async (req, res) => {
  try {
    const {  title,description,scheduleDateTime, duration, status, maxMarks,passingMarks,totalQuestions,category } = req.body;

    // Create new exam
    const newExam = new Exam({
      adminId:req.user.id,
      adminName:req.user.name,
      title,
      description,
      scheduleDateTime,
      duration,
      status,
      maxMarks,
      passingMarks,
      totalQuestions,
      category
    });

    await newExam.save();

    res.status(201).json({ message: "Exam created successfully", exam: newExam });
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({ message: "Server error while creating exam" });
  }
};

//! update exam status
const updateExamStatus =async (req,res) => {
  const { examId } = req.params;
  try {
    const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if(exam.status==="Cancelled"){
    return res.status(400).json({ message: "Cannot update status for Cancelled Exams . please Rescheduled the Exam" });
  }
  const currentTimeUTC = new Date();
  const istTime = new Date(currentTimeUTC.getTime() );

  const examTime = new Date(exam.scheduleDateTime);

  const examEndTime = new Date(exam.scheduleDateTime.getTime() + exam.duration * 60000);
  console.log(istTime )
  console.log( examEndTime)
  if (istTime < examTime) {
    return res.status(400).json({ message: "Cannot update status before scheduled date/time" });
  }
  else if(istTime >= examTime && istTime >= examEndTime){
    exam.status="Completed"
    await exam.save()
  }
  else{
    exam.status = "Ongoing"; 
    await exam.save();
  }

    res.status(200).json({ message: "Exam status updated", exam });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
//! cancelled exam 
const cancelledExam=async (req,res) => {
  const { examId } = req.params;
  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    exam.status="Cancelled"
    await exam.save()
    res.status(200).json({ message: "Exam Cancelled sucessfully", exam });
  } catch (error) {
    console.error("Error cancelled exam:", error);
    res.status(500).json({ message: "Server error" });
  }
}

//! Reschudele Exam
const updateScheduleDateTime =async (req,res) => {
  const { examId } = req.params;
    const { newScheduleDateTime } = req.body;
   
    if (!newScheduleDateTime) {
      return res.status(400).json({ message: "Schedule date and time is required" });
    }
    const istDate = new Date(`${newScheduleDateTime}+05:30`); // ← this is the key
    const utcDate = istDate.toISOString();
  try {
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { scheduleDateTime: utcDate ,status:"Scheduled"},
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      message: "Exam schedule updated successfully",
      updatedExam,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
}


//! live exams

const liveExams=async (req,res) => {
  try {
    const liveexams=await Exam.find({status:"Ongoing"})
    res.status(200).json({message:"All Live Exams",liveexams})
  } catch (error) {
    console.error("Error live Exams:", error);
    res.status(500).json({ message: "Server error" });
  }
  
}

//! all exams
const allExams=async (req,res) => {
  try {
    const allexams=await Exam.find({})
    res.status(200).json({message:"All Live Exams",allexams})
  } catch (error) {
    console.error("Error All Exams:", error);
    res.status(500).json({ message: "Server error" });
  }
  
}


//! delete Exam

const deleteExam=async (req,res) => {
  const {examId}= req.params
  try {
    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json({ message: "Exam deleted successfully", deletedExam });
  } catch (error) {
    console.error("Error Deleting exam:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createExam ,updateExamStatus,cancelledExam,updateScheduleDateTime,liveExams,allExams,deleteExam};
