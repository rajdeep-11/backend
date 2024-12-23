import{asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import{User} from "../models/user.model.js";
import {uploadCloudinary} from "../service/fileUpload.js";
import{ApiResponse} from "../utils/ApiResponse.js";

const registerUser= asyncHandler(async(req,res)=>{

    // res.status(200).json({
    //     message: "OK"
    // })


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


    //data from from or Json that is on req.body():
    //if URL genrates any data we see it next:
    const {fullName,email,username,password}= req.body; // descracture the data:
    console.log("Email:", email);

    //if(fullName===""){
    //     throw new ApiError(400,"FullName is required");
    // }
    // if(email===""){
    //     throw new ApiError(400,"Email is required");
    // }

    if(
        [fullName,email,username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required");
    }

    //if user already existed throw error:
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    });

    //console.log(existedUser);

    if(existedUser){
        throw new ApiError(409, "uername or email is already exists!");
    }
    // console.log(req.files);
    
    //optional chaining:
    const avatarLocalPath= req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path;

    //second option:
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    const avatar=await uploadCloudinary(avatarLocalPath);
    const coverImage=await uploadCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is required");
    }

    //Entry in DataBase:
    const user = await User.create({
        fullName,
        avatar: avatar.url, //only URL will be store in DB
        coverImage: coverImage?.url ||"", //if coverImage is not present then empty
        email,
        password,
        username: username.toLowerCase()
    })
    
    //remove the password and refresh token:
    const userCreated= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userCreated){
        throw new ApiError(500,"Something went wrong during user registeration");
    }

    //return a response to the user that user creatrd:
    return res.status(201).json(
        new ApiResponse(200,userCreated,"user created successfully")
    )

});

export {registerUser}

