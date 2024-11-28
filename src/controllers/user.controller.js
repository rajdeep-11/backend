import{asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import{User} from "../models/user.model.js";
import {uploadCloudinary} from "../service/fileUpload.js";
import{ApiResponse} from "../utils/ApiResponse.js";

const registerUser= asyncHandler(async(req,res)=>{
    //steps:
    //get all the data in frontend
    //validation - not empty
    //check if user alreay exist[check via username or Email]
    //check for images , check for avatar
    //upload the file on cloudinary
    //avatar check in clouinary
    //create user object- create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    //return res else return error

    const {fullName,email,username,password}= req.body;
    // console.log("Email:", email);

    // if(fullName===""){
    //     throw new ApiError(400,"FullName is required")
    // }

    if(
        [fullName,email,username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required");
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    });

    if(existedUser){
        throw new ApiError(409,"This uername is already exist!");
    }
    // console.log(req.files);
    
    const avatarLocalPath=req.files?.avatar[0]?.path;
    //const coverImageLocalPath=req.files?coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    const avatar=await uploadCloudinary(avatarLocalPath);
    const coverImage=await uploadCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is required");
    }

    //create user:
    const user = await User.create({
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url ||"",
        email,
        password,
        username: username.toLowerCase()
    })
    //remove the password and refresh token:
    const userCreated= await User.findById(user._id).select(
        "-password -refreshToken";
    )

    if(!userCreated){
        throw new ApiError(500,"Something went wrong during user registeration");
    }

    //return a response to the user that user creatrd:
    return res.status(201).json(
        new ApiResponse(200,userCreated,"user created successfully");
    )

});

export {registerUser}

