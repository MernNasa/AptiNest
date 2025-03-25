require("dotenv").config()
const express=require("express")
const cors=require("cors")
const userRoute = require("./routes/UserRoutes")
const app=express()

app.use(express.json())
app.use(cors())

app.use("/api",userRoute)



app.listen(process.env.PORT,()=>{
    console.log(`Server is running in http://localhost:${process.env.PORT}`)
})