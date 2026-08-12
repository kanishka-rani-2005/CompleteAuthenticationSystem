import mongoose from "mongoose";



const sessionSchema =new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:[true,"User is required."]
    },
    refreshTokenHash:{
        type:String,
        required:[true,'Refresh Token hash is required.']
    },
    ip:{
        type:String,
        required:[true,'IP address is required.']
    },
    userAgent:{
        type:String,
        required:[true,'User Agent is required.']
    },
    revoked:{
        type:Boolean,
        default:false
    }
},{timestamps:true})


export default mongoose.model("sessions",sessionSchema)