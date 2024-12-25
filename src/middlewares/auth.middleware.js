import {asyncHandler}from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
export const verifyJWT= asyncHandler(async(req,_ ,next)=>{
try {
        //take cookie from token or Authorization:
        const token=req.cookie?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }
    
        //verify it and decode it:
        // Remove refresh token from User:
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user= await User.findById(decodeToken?._id).select
        ("-password -refreshToken");
    
        // if user is invalid:
        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }
    
        //for valid user:
        //add a new object to it:
    
        req.user = user;
        next();
    } catch (error){

        throw new ApiError(401, error?.message || "Invalid Access Token")
    
    }
})