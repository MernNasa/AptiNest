const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
  },
  attemptedQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Results = mongoose.model("Result", ResultSchema);
module.exports=Results