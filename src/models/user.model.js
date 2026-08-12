import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
    username:{
        required:[true,'Username is required'],
        type:String,
        unique:[true,'Username must be unique.']
    },
    email:{
        required:[true,'Email is required'],
        type:String,
        unique:[true,'Email must be unique.']    
    },
    password:{
        required:[true,'Password is required'],
        type:String,
    }
})

export default mongoose.model("users",userSchema)