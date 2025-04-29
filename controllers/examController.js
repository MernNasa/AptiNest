const Exam = require("../models/exam_model");
const Questions = require("../models/questions_model");
const Results = require("../models/result_model");
const User = require("../models/user_model");
const UserAnswer = require("../models/userAnswers_model");


//! Create Exam 


const createExam = async (req, res) => {
  try {
    const {  title,description,scheduleDate,scheduleTime, duration, maxMarks,passMarks,totalQuestions,category } = req.body;
    const combined = new Date(`${scheduleDate}T${scheduleTime}:00`);

    // Create new exam
    const newExam = new Exam({
      adminId:req.user.id,
      adminName:req.user.name,
      title,
      description,
      scheduleDateTime:combined,
      duration,
      status:"Scheduled",
      maxMarks,
      passingMarks:passMarks,
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

/**
 * @swagger
 * /api/live-exams:
 *   get:
 *     summary: Get all live (ongoing) exams
 *     description: Returns a list of all exams that are currently ongoing.
 *     tags:
 *       - Exams
 *     responses:
 *       200:
 *         description: Successfully fetched all ongoing exams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All Live Exams
 *                 liveexams:
 *                   type: array
 *                   items:
 *                     
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
/**
 * @swagger
 * /api/all-exams:
 *   get:
 *     summary: Get all exams
 *     description: Returns a list of all exams regardless of their status.
 *     tags:
 *       - Exams
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
 *                   example: All Live Exams
 *                 allexams:
 *                   type: array
 *                   items:
 *                     
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


//! add question the individual questions

const addquestions=async (req,res) => {
  const {examId,questions}=req.body
  try {
    if (!examId) {
      return res.status(400).json({ message: "examId is required" });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions array is required" });
    }
    const questionsWithExamId = questions.map((q) => ({
      ...q,
      examId,
    }));
    const docs = questionsWithExamId.map((q) => new Questions(q));
    for (let doc of docs) {
      await doc.validate(); // will throw if validation fails
    }
    const insertedQuestions = await Questions.insertMany(questionsWithExamId, {
      ordered: true,
    });
    res.status(201).json({
      message: "Questions added successfully",
      data: insertedQuestions,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: error.message });
    }
    console.error("Error adding question to the exam:", error);
    res.status(500).json({ message: "Server error" });
  }
  
}

//! fetch all question for the individual exam
const examQuestion=async (req,res) => {
  const {examId}=req.params
  if(!examId){
    return res.status(400).json({message:"ExamId is required"})
  }
  const curentExam=await Exam.findById(examId)
  if(!curentExam){
    return res.status(404).json({message:"Exam is Not Found"})
  }
  const questions = await Questions.find({ examId });
  if(questions.length===0){
    return res.status(200).json({message:"No Question are there for this Exam"})
  }
  return res.status(200).json({
    message: "Questions fetched successfully",
    data: questions,
  });
}


//! update a individual question

const updateQuestion=async (req, res) => {
  const { questionId } = req.params;
  const updateData = req.body;

  try {
    let question = await Questions.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update fields
    question.questionText = updateData.questionText || question.questionText;
    question.options = updateData.options || question.options;
    question.correctAnswer = updateData.correctAnswer || question.correctAnswer;
    question.marks = updateData.marks || question.marks;
    question.difficultyLevel = updateData.difficultyLevel || question.difficultyLevel;

    // Validate and Save
    await question.validate();
    const updatedQuestion = await question.save();

    res.status(200).json({
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

//! delete the individual questions
const deleteQuestion=async (req,res) => {
  const {questionId}=req.params
  try {
    const question = await Questions.findByIdAndDelete(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question deleted successfully",
      data: question,
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

//! attend exam
const attendExam=async (req,res) => {
  const {examId}=req.body
  const userId=req.user.id
  if (!examId || !userId) {
    return res.status(400).json({ message: "examId and userId are required" });
  }
  try {
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "You need to register before attending the exam" });
    }
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    if (exam.status !== "Ongoing") {
      return res.status(403).json({ message: `Exam is not ongoing, current status: ${exam.status}` });
    }
    const questions = await Questions.find({ examId },{correctAnswer:0,createdAt:0});
    return res.status(200).json({
      message: "Questions fetched successfully",
      data: questions,
    });

  } catch (error) {
    console.error("Error adding question to the exam:", error);
    res.status(500).json({ message: "Server error" });
  }
}

//! resultsCalculation

const resultsCalculation = async (req, res) => {
  const { examId } = req.params;
  const BATCH_SIZE = 100;

  try {
    // 1. Get all questions and map them by stringified ID
    const allQuestions = await Questions.find({ examId });
    const questionMap = {};
    allQuestions.forEach(question => {
      questionMap[question._id.toString()] = {
        correctAnswer: question.correctAnswer,
        marks: question.marks
      };
    });

    // 2. Get all user submissions for this exam
    const submissions = await UserAnswer.find({ examId });

    let processedCount = 0;
    let batchResults = [];
    let batchCounter = 0;

    // 3. Process each submission
    for (const submission of submissions) {
      let totalScore = 0;
      let attemptedQuestions = 0;
      let correctAnswers = 0;
      for (const answer of submission.answers) {
        const qid = answer.questionId.toString();
        const question = questionMap[qid];

        if (question) {
          attemptedQuestions++;
          if (answer.selectedOption === question.correctAnswer) {
            correctAnswers++;
            totalScore += question.marks;
          }
        }
      }

      // 4. Prepare result document for bulkWrite
      batchResults.push({
        updateOne: {
          filter: { userId: submission.userId, examId: submission.examId },
          update: {
            $set: {
              userId: submission.userId,
              examId: submission.examId,
              totalScore,
              attemptedQuestions,
              correctAnswers,
              submittedAt: submission.submittedAt
            }
          },
          upsert: true
        }
      });

      processedCount++;

      // 5. Bulk write in batches
      if (batchResults.length >= BATCH_SIZE) {
        await Results.bulkWrite(batchResults);
        batchResults = [];
        batchCounter++;
      }
    }

    // 6. Final batch
    if (batchResults.length > 0) {
      await Results.bulkWrite(batchResults);
      batchCounter++;
    }

    res.status(200).json({
      message: "Result calculation completed",
      totalProcessed: processedCount,
      batchesProcessed: batchCounter
    });

  } catch (error) {
    console.error("Error in batch processing results:", error);
    res.status(500).json({
      message: "Error in batch processing results",
      error: error.message
    });
  }
};


const examsubmit=async (req,res) => {
  try {
    const userId=req.user.id
  const {examId,answers}=req.body
  if (!userId || !examId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Missing or invalid data" });
  }
  const existAnswers=await UserAnswer.findOne({userId,examId})
  if(existAnswers){
    return res.status(400).json({ message: "You already submitted this exam" });
  }
  const currentExam=await Exam.findById(examId)
   if(currentExam.status==="Ongoing"){
    const useranswer=new UserAnswer({
      userId,
      examId,
      answers
    })
    await useranswer.save()
    res.status(201).json({ message: "Exam Submitted successfully", });
   }
   else{
    res.status(400).json({ message: "You can't submitted the exam", });
   }
  
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }

}

const userresult=async (req,res) => {
  try {
    const {examId}=req.params
    const userId=req.user.id
    const results=await Results.find({userId,examId})
    res.status(200).json({message:"Successfully fetched Results",results})
  } catch (error) {
    console.error("Error fetching the results:", error);
    res.status(500).json({ message: "Server error" });
  }
}


const examResponse = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.id;

    // Step 1: Fetch all questions of the exam
    const allQuestions = await Questions.find({ examId });
    const questionMap = {};
    allQuestions.forEach(question => {
      questionMap[question._id.toString()] = {
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        marks: question.marks
      };
    });

    // Step 2: Get user's answers without nested _id
    const examresponse = await UserAnswer.find({ examId, userId }, { _id: 0 });

    const userAnswers = examresponse.flatMap(entry => 
      entry.answers.map(answer => {
        const qid = answer.questionId.toString();
        const questionData = questionMap[qid] || {};

        return {
          questionId: qid,
          questionText: questionData.questionText || "Unknown",
          correctAnswer: questionData.correctAnswer || "Unknown",
          selectedOption: answer.selectedOption
        };
      })
    );

    // Step 3: Send combined result
    res.status(200).json({
      message: "Successfully fetched detailed response",
      examId,
      answers: userAnswers
    });

  } catch (error) {
    console.error("Error fetching the exam Response:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createExam ,updateExamStatus,cancelledExam,updateScheduleDateTime,liveExams,allExams,deleteExam,addquestions,attendExam,examQuestion,updateQuestion,deleteQuestion,resultsCalculation,examsubmit,userresult,examResponse};
