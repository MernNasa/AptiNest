const express=require("express")

const userRoute=express.Router()

userRoute.get("/user",async (req,res) => {
    res.send("user router")
})
module.exports=userRoute