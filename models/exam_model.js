const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  adminName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  scheduleDateTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  status: {
    type: String,
    enum: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  maxMarks: {
    type: Number,
    required: true,
  },
  passingMarks: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
  },
});

const Exam= mongoose.model("Exam", ExamSchema);
module.exports =Exam