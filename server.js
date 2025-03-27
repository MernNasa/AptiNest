require("dotenv").config()
const express=require("express")
const cors=require("cors")
const cookieParser = require('cookie-parser');
const userRoute = require("./routes/UserRoutes")
const { adminRouter } = require("./routes/adminRoutes")
const ConnectDB = require("./config/db")
const app=express()
ConnectDB()
app.use(express.json())
app.use(
    cors({
      origin: 'http://localhost:5173', // ✅ Allow frontend URL only (NOT '*')
      credentials: true, // ✅ Allow sending cookies
    })
  );
app.use(cookieParser())

app.use("/api",userRoute)
app.use("/api",adminRouter)


app.listen(process.env.PORT,()=>{
    console.log(`Server is running in http://localhost:${process.env.PORT}`)
})