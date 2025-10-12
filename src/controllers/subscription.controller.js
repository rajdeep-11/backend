import mongoose, {isValidObjectId} from "mongoose"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req,res) => {

    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }

    if(channelId === req.user?._id.toString()){
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    //check if subscription alreday exist:
    //if exist unsubscribe:
    const existingUser = await Subscription.findOne({
        subscriber : req.user?._id,
        channel : channelId
    })

    if(existingUser){
        await Subscription.findByIdAndDelete(existingUser._id)

        return res.status(200).json(
            new ApiResponse(200, {isSubscribed : false}, "Unsubscribed Successfully")
        )
    }else{
        const newSubscription = await Subscription.create({
            subscriber : req.user?._id,
            channel : channelId
        })

        res.status(200).json(
            new ApiResponse(201, {isSubscribed : true}, "Subscribed Successfully")
        )
    }

})


const getUserChannelSubscriber = asyncHandler(async (req,res) => {
    
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriberDetails"
            }
        },
        {
            $unwind : "$subscriberDetails"
        },
        {
            $project : {
                _id : "$subscriberDetails._id",
                username : "$subscriberDetails.username",
                fullName : "$subscriberDetails.fullName",
                avatar : "$subscriberDetails.avatar",
                subscribedAt : "$createdAt"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            201, 
            {subscriberCount: subscribers.length}, 
            "Subscriber featched Successfully"
        )
    )

})


const getSubscribedChannels = asyncHandler(async (req,res) => {
    
    const {subscriberId} = req.params

    if(!subscriberId){
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const user = await User.findById(subscriberId)
    if(!user){
        throw new ApiError(404, "user not found")
    }

    //get all subscribed channels:
    const subscribedChannels = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "user",
                localField : "channel",
                foreignField : "_id",
                as : "channelDetails"
            }
        },
        {
            $unwind : "$channelDetails"
        },
        {
            $project : {
                _id : "$channelDetails._id",
                username : "$channelDetails.username",
                fullName : "$channelDetails.fullName",
                avatar : "$channelDetails.avatar",
                subscribedAt : "$createAt"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            { channels : subscribedChannels, channelCount : subscribedChannels.length },
            "Subscribed channel featched Successfully"
        )
    )

})


export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels
}

