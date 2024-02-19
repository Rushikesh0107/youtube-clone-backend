import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const videoExists = await Video.findById(videoId)

    if(!videoExists){
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.aggregate(
        [
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId) 
                }
            },
            {
                $skip: (page - 1)*limit
            },
            {
                $limit: parseInt(limit, 10)
            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                comments: comment
            },
            "Comments fetched successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {content, video} = req.body
    const owner = req.user._id
    
    if(!mongoose.isValidObjectId(owner)){
        throw new ApiError(400, "Invalid video id")
    }

    if(!(content && video)){
        throw new ApiError(400, "Content and video are required")
    }

    const videoExists = await Video.findById(video)

    if(!videoExists){
        throw new ApiError(404, "Video not found")
    }

    // console.log(content, video, owner);

    const comment = await Comment.create(
        {
            content,
            video,
            owner
        }
    )

    // console.log(comment);

    if(!comment){
        throw new ApiError(500, "Failed to add comment")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {
                comment
            },
            "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId} = req.params

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content: req.body.content
        },
        {
            new: true
        }
    )

    if(!comment){
        throw new ApiError(500, "Failed to update comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                comment
            },
            "Comment updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(500, "Failed to delete comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}