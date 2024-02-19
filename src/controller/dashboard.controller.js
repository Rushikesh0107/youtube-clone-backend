import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const {channelId} = req.params
    let response = {}

    const totalSubscribers = await Subscription.find({channel: channelId})

    if(!totalSubscribers) {
        throw new ApiError(404, "No channel found")
    }

    const totalVideos = await Video.find({owner: channelId})

    if(!totalVideos) {
        throw new ApiError(404, "No videos found")
    }

    const totalLikes = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: "$_id",
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                likes: 1
            }
        },
        {
            $unwind: "$likes"
        },
        {
            $project: {
                _id: 0,
                likes: 1
            }
        },
        {
            $count: "totalLikes"
        }
    ]);

    if(!totalLikes){
        throw new ApiError(404, "No likes found")
    }

    const totalViews = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: {
                        $sum: "$views"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalViews: 1
                }
            }
        ]
    )

    console.log(totalViews);

    response = {
        totalSubscribers: totalSubscribers.length,
        totalVideos: totalVideos.length,
        totalLikes: totalLikes[0].totalLikes,
        totalViews: totalViews[0].totalViews
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const {channelId} = req.params

    if(!channelId) {
        throw new ApiError(400, "Channel Id is required")
    }

    const videos = await Video.find({owner: channelId})

    if(!videos) {
        throw new ApiError(404, "No videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {videos},
            "Channel videos fetched successfully"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }