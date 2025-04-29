const mongoose=require("mongoose")

const ConnectDB= async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database Connected")
    } catch (error) {
        console.log(error)
        console.log("Failed to Connect the DB")
        process.exit(1)
    }
}
module.exports=ConnectDB