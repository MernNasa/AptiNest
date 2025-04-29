const mongoose=require("mongoose")
const userAnswerschema=new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOption: String
    }
  ],
  submittedAt: { type: Date, default: Date.now }
})

const UserAnswer=mongoose.model('useranswer',userAnswerschema)
module.exports=UserAnswer