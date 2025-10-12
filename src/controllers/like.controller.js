import mongoose , {isValidObjectId} from "mongoose";
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req,res) => {
    
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invaild video ID")
    }

    const existLike = await Like.findOne({
        video : videoId,
        likedBy : req.user?._id
    })

    if(existLike){
        await Like.findByIdAndDelete(existLike._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                {isLiked : false},
                "Video unliked successfully"
            )
        )
    }
    else{
        const like = await Like.create({
            video : videoId,
            likedBy : req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(
                200,
                {isLiked : true},
                "Video liekd successfully"
            )
        )
    }

})


const toggleCommentLike = asyncHandler(async (req,res) => {
    
    const {commnetId} = req.params

    if(!isValidObjectId(commnetId)){
        throw new ApiError(400, "Inavlid comment ID")
    }

    const existingLike = await Like.findOne({
        comment : commnetId,
        LikedBy : req.user?._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                {isLiked : false},
                "Comment unliked successfully"
            )
        )
    }
    else{
        const like = await Like.create({
            comment : commnetId,
            likedBy : req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(
                201,
                {isLiked : true},
                "Comment liked successfully"
            )
        )
    }

})

const toggletweetLike = asyncHandler(async (req,res) => {

    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Inavlid tweet ID")
    }

    const existingLike = await Like.findOne({
        tweet : tweetId,
        LikedBy : req.user?._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                {isLiked : false},
                "Tweet unliked successfully"
            )
        )
    }
    else{
        const like = await Like.create({
            comment : commnetId,
            likedBy : req.user?._id
        })

        return res.status(400).json(
            new ApiResponse(
                201,
                {isLiked : true},
                "Tweet liked successfully"
            )
        )
    }

})


const getLikedVideos = asyncHandler(async (req,res) => {
    
    const likedVideos = await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(req.user?._id),
                video : {$exist : true}
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreginField :  "_id",
                as : "videoDetails",

                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreginField : "_id",
                            as : "ownerDetails",

                            pipeline : [
                                {
                                    $project : {
                                        username : 1,
                                        fullName : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {$first : "$ownerDetails"}
                        }
                    },
                    {
                        $project : {
                            ownerDeatils : 0
                        }
                    }
                ]
            }
        },
        {
            $unwind : $videoDetails
        },
        {
            $project : {
                _id : 0,
                video : "$videoDetails"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked videos featch successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggletweetLike,
    toggleVideoLike,
    getLikedVideos
}