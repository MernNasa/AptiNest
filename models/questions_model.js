const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, "Exactly 4 options required"],
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return this.options.includes(value);
      },
      message: "Correct answer must be one of the options",
    },
  },
  marks: {
    type: Number,
    required: true,
  },
  difficultyLevel: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Questions = mongoose.model("Question", QuestionSchema);
module.exports=Questions