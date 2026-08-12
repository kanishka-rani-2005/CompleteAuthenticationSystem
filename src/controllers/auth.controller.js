
import userModel from '../models/user.model.js'
import crypto from 'crypto'
import jsonwebtoken from 'jsonwebtoken'
import config  from '../config/config.js';
import { json } from 'stream/consumers';
import sessionModel from '../models/session.model.js';
import { rmSync } from 'fs';

async function register(req,res) {
    
    const {username,email,password}=req.body;

    const isExist=await userModel.findOne({
        $or:[{username},{email}]
    })

    if(isExist){
        return res.status(409).json({
            message:"username or email already exist."
        })
    }

    const hashedPass=crypto.createHash('sha256').update(password).digest('hex')

    const user = await userModel.create({
        username,
        email,
        password: hashedPass
    });

    const refreshToken=jsonwebtoken.sign(
        { id: user._id },
        config.JWT_SECRET,{expiresIn:"7d"}
    );

    const refreshTokenHash=crypto.createHash('sha256').update(refreshToken).digest('hex')
    const session=await sessionModel.create({
        user:user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers['user-agent']
    })

    const accessToken = jsonwebtoken.sign(
        { id: user._id,sessionId:session._id },
        config.JWT_SECRET,{expiresIn:"15m"}
    );


    res.cookie("refreshToken",refreshToken,{
        httpOnly:true, // so that js cannot access token
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*20*1000  //7 days
    })

    return res.status(201).json({
        message: "User registered successfully.",
        user,
        accessToken
    });

}

async function getUser(req,res){

    // const {email,password}=req.body
    const token=req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(402).json({
            message:"Token not found"
        })
    }
    const decoded=jsonwebtoken.verify(token,config.JWT_SECRET)

    const user=await userModel.findById(decoded.id)

    if(!user){
        return res.status(404).json({
            message:"User not available"
        })
    }

    // console.log(user)

    return res.status(200).json({
        message:"User Fetched Succesfully.",
        user
    })


}

async function refreshToken(req,res) {
    const refreshToken=req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(404).json({
            message:"Cannot Fetch User , Token invalid"
        })
    }

    const decoded=jsonwebtoken.verify(refreshToken,config.JWT_SECRET)

    const refreshTokenHash=crypto.createHash('sha256').update(refreshToken).digest('hex')

    const session=await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
        return res.status(401).json({
            message:"Invalid refresh Token "
        })
    }

    const accessToken=jsonwebtoken.sign({id:decoded.id},config.JWT_SECRET,{expiresIn:'15m'})

    const newRefreshToken=jsonwebtoken.sign({id:decoded.id},config.JWT_SECRET,{expiresIn:'7d'})

    const newrefreshTokenHash=crypto.createHash('sha256').update(newRefreshToken).digest('hex')

    session.refreshTokenHash=newrefreshTokenHash;
    await session.save();

    res.cookie("refreshToken",newRefreshToken,{
        httpOnly:true, // so that js cannot access token
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*20*1000  //7 days
    })

    return res.status(200).json({
        message:"Access token generated sucessfully.",
        token:accessToken
    })
}

async function logout(req,res) {

    const refreshToken=req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const refreshTokenHash=crypto.createHash('sha256').update(refreshToken).digest('hex')

    const session=await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
        return res.status(400).json({
            message:"Invalid refresh Token "
        })
    }

    session.revoked=true;
    await session.save();

    res.clearCookie("refreshToken");

    return res.status(200).json({
        message:"Successfully logout"
    })
   
}

async function logoutAll(req,res) {
    const refreshToken=req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }
    const decoded=jsonwebtoken.verify(refreshToken,config.JWT_SECRET)

    await sessionModel.updateMany({
        user:decoded._id,
        revoked:false
    },{
        revoked:true
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message:"Logout from all devices successfully"
    })
}

async function login(req,res){
    const {email,password}=req.body;

    const user=await userModel.findOne({email})

    if(!user){
        return res.status(404).json({message:'Register first'})
    }

    const hashedPassword=crypto.createHash("sha256").update(password).digest("hex")

    const isPasswordValid=hashedPassword===user.password

    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid Password"
        })
    }

    const refreshToken=jsonwebtoken.sign({
        id:user._id
    },config.JWT_SECRET,{expiresIn:'7d'})


    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session=await sessionModel.create({
        user:user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers['user-agent']
    })

    const accessToken=jsonwebtoken.sign({
        id:user._id,
        sessionId:session._id
    },config.JWT_SECRET,{expiresIn:'15m'})

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000//7 days
    })

    res.status(200).json({
        message:"Login Successfully",
        user,
        accessToken
    })
    
}

export default {
    register,
    getUser,
    refreshToken,
    logout,
    logoutAll,
    login
}