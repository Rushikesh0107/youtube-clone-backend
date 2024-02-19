import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const {content} = req.body;
    const owner = req.user._id;

    if(!mongoose.isValidObjectId(owner)){
        throw new ApiError(400, "Invalid user id")
    }

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner
        }
    )

    if(!tweet){
        throw new ApiError(500, "Tweet not created")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {tweet},
            "Tweet created successfully"
        )
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const tweets = await Tweet.find({owner: userId})

    if(!tweets){
        throw new ApiError(404, "No tweets found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {tweets},
            "Tweets fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId} = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: req.body.content
        },
        {
            new: true,
        }
    )

    if(!tweet){
        throw new ApiError(500, "Failed to update tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {tweet},
            "Tweet updated successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(500, "Failed to delete tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}