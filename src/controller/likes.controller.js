import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const like = await Like.findOne({video: videoId , likedBy: req.user._id})

    // console.log(like);

    if(like){
        await Like.findByIdAndDelete(like._id)
    }else {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Like toggled successfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const like = await Like.findOne({commentId, userId: req.user._id})

    if(like){
        await Like.findByIdAndDelete(like._id)
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Like toggled successfully"
        )
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const like = await Like.findOne({tweetId, userId: req.user._id})

    if(like){
        await Like.findByIdAndDelete(like._id)
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Like toggled successfully"
        )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId = req.user._id

    if(!userId){
        throw new ApiError(400, "Invalid user id")
    }

    const likedVideos = await Like.aggregate(
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId),
                }
            },
            {
                $group: {
                    _id: "$video",
                }
            },
            {
                $lookup: {
                    from : "videos",
                    localField: "_id",
                    foreignField: "_id",
                    as: "videos",
                }
            }
        ]
    )

    // console.log(likedVideos);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked videos fetched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}