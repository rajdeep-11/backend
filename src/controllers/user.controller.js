import{asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import{User} from "../models/user.model.js";
import {uploadCloudinary} from "../service/fileUpload.js";
import{ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


//gentare access and refresh tokens:
const genrateAccessAndRefreshTokens= async(userId)=>{
    try {
        const user=await User.findById(userId);

        const AccessToken=user.generateAccessToken(user);
        const RefreshToken=user.generateRefreshToken(user);

        //save the refresh tokenin DB:
        user.refreshToken=RefreshToken;
        await user.save({ validateBeforeSave: false });

        //return to the user:
        return {AccessToken,RefreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong during generating tokens")
    }
}

//user registration:
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

//login User
const loginUser= asyncHandler(async(req,res)=>{
    //req body-> data
    //check the username or email
    //find the user in db
    //password check
    // access and refresh token both genrate 
    //send to cookies 
    //response

    const{username, email, password}=req.body;

    if(!username && !email){
        throw new ApiError(400,"username and password required");
    }

    //find the username or email in db:
    const user= await User.findOne({
        $or:[{username}, {email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist!");
    }
    //password check:
    const isPasswordVaild=await user.isCorrectPassword(password);

    if(!isPasswordVaild){
        throw new ApiError(401,"Invalid user credentials");
    }

    //access and refresh token:
    const {AccessToken, RefreshToken}= await genrateAccessAndRefreshTokens(user._id);

    //update the user by another or again a expensive DB calls:
    const loggedInUser= await User.findById(user._id).select
    ("-password -refreshToken");

    //send to cookies:[modify from server only]
    const options={
        httpOnly: true, // Prevent accessing the cookie from client-side
        secure: true,
        sameSite: 'Strict'// Prevent CSRF attacks
    }
    
    return res
    .status(200)
    .cookie("AccessToken",AccessToken,options,{maxAge:3600 * 1000 })
    .cookie("RefreshToken",RefreshToken,options,{maxAge:10*24*3600*1000})
    .json(
        new ApiResponse(
        200,
        {
            user:loggedInUser,AccessToken,RefreshToken
        },
        "User logged In SuccessFully"
        )
    )
});


//logOut User
const logOutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                //refreshToken from user model:
                refreshToken: 1
            }
        },
        {
            //new updated user with new credentials:
            new: true
        }
    )
    //clear the cookie:
    const options={
        httpOnly: true, 
        secure: true,
        sameSite: 'Strict'
    }

    return res
    .status(200)
    .clearCookie("AccessToken",options,{maxAge:3600 * 1000 })
    .clearCookie("RefreshToken",options,{maxAge:10*24*3600*1000})
    .json(new ApiResponse(200),{},"Logged Out Successfully")
})

//endPoint for refresh access token:
const refreshAccessToken= asyncHandler(async(req,res)=>{
    //access the Access token from cookies:
    const incomingRefreshToken= req.cookies.refreshAccessToken || req.body.refreshAccessToken;

    if(!incomingRefreshToken){
        throw new ApiError(404,"Unautorized request!");
    }

    try {
        //verify the token and decoded toekn:
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        //get the infromation by the token:
        const user= await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(402, "Invalid refresh token!");
        }
        // match both the tokens:
        if(refreshAccessToken !== user?.RefreshToken){
            throw new ApiError(403, "Refresh token is expired!")
        }
    
        //genrate new access and refrseh tokens:
        const options={
            httpOnly: true, 
            secure: true,
            sameSite: 'Strict'
        }
        const {NewAccessToken,NewRefreshToken} = await genrateAccessAndRefreshTokens(user?._id);
    
        return res
        .status(200)
        .cookie("AccessToken",NewAccessToken,options,{maxAge: 3600*1000})
        .cookie("RefreshToekn",NewRefreshToken,options,{maxAge: 10*24*3600*1000})
        .json(
            new ApiResponse(
                200,
                {NewAccessToken, refreshToken: NewRefreshToken},
                "AccessToekn refreshed"
            )
        )
    }catch (error) {
        throw new ApiError(401, error?.message || "Invalid refrseh token");
    }
})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
}

