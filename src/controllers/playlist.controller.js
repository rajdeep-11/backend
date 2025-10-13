import mongoose , {isValidObjectId, Types} from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist  = asyncHandler(async (req,res) => {
    
    const {name , decsription} = req.body

    if(!name?.trim()){
        throw new ApiError(400, "Name is required")
    }

    const playlist = await Playlist.create({
        name : name.trim(),
        decsription : decsription || "",
        owner : req.body?._id,
        videos : []
    })

    if(!playlist){
        throw new ApiError(400, "Playlist not created")
    }

    return res.status(201).json(
        ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )


})

const addVideoToPlaylist = asyncHandler (async (req,res) => {
    
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    //check for ownership:
    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You are not authorized to modify this playlist")
    }

    //if video already exist in the playlist:

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video is alredy exist")
    }

    //add video to playlist:
    playlist.videos.push(videoId)
    await playlist.save()


    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "video added to playlist successfully"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req,res) => {
    const {playlistId, videoId} = req.params
    
    // Validate IDs
    if (!isValidObjectId(playlistId || !isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid playlist ID or Video ID")
    }
    
    // check ownership
    const playlist = await Playlist.findById(playlistId)
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist")
    }

    const videoIndex = playlist.videos.indexof(videoId)
    if(videoIndex === -1){
        throw new ApiError(404, "Video cannot found in playlist")
    }

    //remove video from playlist:
    playlist.videos.splice(videoIndex , 1)
    await playlist.save()

    return res.status(200).json(
        new ApiError(
            200,
            playlist,
            "Video remove from playlist successfilly"
        )
    )

})


const updatePlaylist = asyncHandler(async (req,res) => {
    
    const {playlistId} = req.params
    const {name , description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invaild playlist ID")
    }

    if(!name && !description){
        throw new ApiError(400, "At least one field {name , description} is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    //update:
    if(name?.trim()){
        playlist.name = name.trim()
    }
    if(description !== undefined){
        playlist.decsription = description.trim()
    }

    await playlist.save()
    return res.status(200).json(
        new ApiError(
            200,
            playlist,
            "Playlist updated successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req,res) => {
    
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invaild playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist")
    }

    //Delete playlist:
    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Playlist delete successfully"
        )
    )
})

const getUserPlaylist = asyncHandler(async (req,res) => {
    
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invaild user ID")
    }

    const playlist = await Playlist.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "videos",
                foreinField : "_id",
                as : "videos"
            }
        },
        {
            $addFields : {
                totalVideos : {$size : "$videos"},
                totalViews : {$sum : "$videos.views"}
            }
        },
        {
            $project : {
                _id : 1,
                username : 1,
                description : 1,
                totalVideos : 1,
                totalViews : 1,
                createdAt : 1,
                updatedAt : 1

            }
        }
    ])


    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "User playlist featched successfully"
        )
    )
})

const getPlaylistById= asyncHandler(async (req,res) => {
    
    const {playListId} = req.params

    if(!isValidObjectId(playListId)){
        throw new ApiError(400, "Invaild playlist ID")
    }

    const playlist = await Playlist.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(playListId)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "videos",
                foreinField : "_id",
                as : "videos",
                
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : owner,
                            foreignField : "_id",
                            as : "owner",

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
                            owner : {$first : "$owner"}
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" },
                owner: { $first: "$owner" }
            }
        }
    ])
    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist[0],
            "Playlist fetched successfully"
        )
    )
    
})

export {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    getUserPlaylist,
    getPlaylistById

}