import mogoose,{isVaildObjectId} from mongoose
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadCloudinary } from "../service/fileUpload.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getAllVideos = asyncHandler(async(req,res) => {
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query;

    //convert to Integer:
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * skip;

    //filter object:
    const filter = {};

    if(userId){
        if(!isVaildObjectId(userId)){
            throw new ApiError(400, "Invalid User ID");
        }
        filter.owner = userId;
    }

    if(query){
        filter.$or = [
            {title : {$regex : query, $options : "i"}},
            {description : {$regex : query, $options : "i"}}
        ]
    }

    //Build sort object:
    const sortOptions = {}
    if(sortBy){
        sortOptions[sortBy] = sortType ==="desc" ? -1 : 1
    }
    else{
        sortOptions.createdAt = -1
    }

    //Query for videos:
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("owner", "username email avatar")
    
    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination:{
                    currPage : pageNum,
                    totalPage : Math.ceil(totalVideos / limitNum),
                    totalVideos,
                    limit : limitNum
                }
            },
            "Videos fetched Successfully"
        )
    )

})

const publishAVideo = asyncHandler(async(req,res) => {
    const {title, discription} = req.body;

    if(!title || !discription){
        throw new ApiError(400, "Title and discription required !!")
    }

    //get videoFiles:
    const videoFileLocalPath = req.files?.videoFiles?.[0]?.path

    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file is required")
    }


    //get thumbniles:
    const thumbnilLocalPath = req.files?.thumbnile?.[0]?.path

    if(!thumbnilLocalPath){
        throw new ApiError(400, "Thumbnil is required")
    }

    //upload video to cloudinary:
    const videoFile = await uploadCloudinary(videoFileLocalPath);
    if(!videoFile){
        throw new ApiError(500, "Failed to uplaod video")
    }

    //upload thumbnil to cloudinary:
    const thumbnil = await uploadCloudinary(thumbnilLocalPath);
    if(!thumbnil){
        throw new ApiError(500, "Failed to upload thumbnil")
    }

    // video document:
    const video = await Video.create({
        videoFile : videoFile.url,
        thumbnil : thumbnil.url,
        title,
        description,
        duration: videoFile.duration || 0,
        owner : req.user._id,
        isPublished : true
    })

    if(!video){
        throw new ApiError(500, "Failed to create video")
    }

    return res.status(201).json(
        new ApiResponse(201, video, "Video Publish successfully")
    )

})


const getVideoById = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    if(!isVaildObjectId(videoId)){
        throw new ApiError(400, "Invaild video Id")
    }

    //find video and populate other details:
    const video = await Video.findById(videoId).populate(
        "owner",
        "username email avatar"
    )

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    //increment the views:
    video.views += 1
    await video.save({validateBeforeSave : false})

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async(req,res) =>{
    const {videoId} = req.params
    const{title, description} = req.body

    //validate:
    if(!isVaildObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id")
    }

    if(!title && !description){
        throw new ApiError(400, "Fields are not provided")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    //if user is not owner:
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(404, "You are not authorized to update this video")
    }

    if(title) video.title = title
    if(description) video.description = description

    //update thumbnil:
    if(req.file){
        const thumbnilLocalPath = req.file.path
        const thumbnil = await uploadCloudinary(thumbnilLocalPath)

        if(!thumbnil){
            throw new ApiError(500, "Failed to upload thumbnil")
        }

        video.thumbnil = thumbnil.url
    }

    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Video update successfully")
    )

})

const deleteVideo = asyncHandler(async(req,res)=>{

    const {videoId} = req.params

    if(!isVaildObjectId(videoId)){
        throw new ApiError(400, "Inavlid video Id")
    }

    //find video:
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    //check if user is owner:
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(404, "You are unatthorized to delete this video")
    }

    await Video.findOneAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Video delete successfully")
    )
})

export{
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
}
