import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {ApiRes} from '../utils/ApiRes.js'
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'


const  generateAccessTokenandRefreshToken=async (id)=>{
   try {
     const user=await User.findById(id);
     // if(!user){
     //     throw new ApiError(400,"User not found while generating token");
     // }
     const genaccesstoken=user.generateAccessToken();
     const genrefreshtoken=user.generateRefreshToken();
     user.refreshtoken=genrefreshtoken;
     await user.save({validateBeforeSave:false})//save in database
 
     return {genaccesstoken,genrefreshtoken};
   } catch (error) {
        throw new ApiError(500, "Somethin went erro while generationg access token and Refresh token")
   }
}

const loginStudent=asyncHandler(async (req,res)=>{
    //load data from req body
    //roomno, password
    //check on both
    //refresh token for stu snd admin
    //send cookie

    const{room_no,password}=req.body
    if(!(room_no||password)){
        throw new ApiError(400,"All fields are required")
    }
    const userexist= await User.findOne({
        room_no
    })
    if(!userexist){
        throw new ApiError(400, "User doesnot exit");
    }

    const ispassvalid=await ispasswaordCorrect(password);
     if(!ispassvalid){
        throw new ApiError(400,"Invalid Credentials.");
    }
    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(userexist._id)

    const loggedinuser=await User.findById(userexist._id);

    const options={
        httponly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accesstoken",accessToken,options)
    .cookie("refreshtoken",refreshToken,options)
    .json(
        new ApiRes(200,
            {
                user:loggedinuser,accessToken,refreshToken
            },
            "User loggedin Succesfully "
        )
    )
});

const logoutStudent=asyncHandler(async(req,res)=>{
    //find the user 
    //clear tokens
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshtoken:1
            }
        },
        {new:true}
    )

    const options={
        httponly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRes(200,{},"User logged out Successfully"))
});



export{
    loginStudent,
    logoutStudent
}
