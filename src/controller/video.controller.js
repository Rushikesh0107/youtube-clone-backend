import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

        // Parse page and limit to numbers
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);
    
        // Validate and adjust page and limit values
        page = Math.max(1, page); // Ensure page is at least 1
        limit = Math.min(20, Math.max(1, limit)); // Ensure limit is between 1 and 20
    
        const pipeline = [];
    
        // Match videos by owner userId if provided
        if (userId) {
            if (!isValidObjectId(userId)) {
                throw new ApiError(400, "userId is invalid");
            }
    
            pipeline.push({
                $match: {
                    owner: mongoose.Types.ObjectId(userId)
                }
            });
        }
    
        // Match videos based on search query
        if (query) {
            pipeline.push({
                $match: {
                    $text: {
                        $search: query
                    }
                }
            });
        }
    
        // Sort pipeline stage based on sortBy and sortType
        const sortCriteria = {};
        if (sortBy && sortType) {
            sortCriteria[sortBy] = sortType === "asc" ? 1 : -1;
            pipeline.push({
                $sort: sortCriteria
            });
        } else {
            // Default sorting by createdAt if sortBy and sortType are not provided
            sortCriteria["createdAt"] = -1;
            pipeline.push({
                $sort: sortCriteria
            });
        }
    
        // Apply pagination using skip and limit
        pipeline.push({
            $skip: (page - 1) * limit
        });
        pipeline.push({
            $limit: limit
        });
    
        // Execute aggregation pipeline
        const Videos = await Video.aggregate(pipeline);
    
        if (!Videos || Videos.length === 0) {
            throw new ApiError(404, "Videos not found");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                Videos, 
                "Videos fetched Successfully"
        ));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!(title && description)){
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files.video?.[0]?.path;
    const thumbnailFileLocalPath = req.files.thumbnail?.[0]?.path;

    // console.log(videoFileLocalPath, thumbnailFileLocalPath);

    if(!videoFileLocalPath || !thumbnailFileLocalPath){
        throw new ApiError(400, "Video and thumbnail are required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath)

    //console.log(videoFile, thumbnailFile);

    if(!videoFile || !thumbnailFile){
        throw new ApiError(500, "Error uploading video or thumbnail")
    }

    const video = await Video.create(
        {
            title,
            description,
            videoFile: videoFile?.secure_url,
            thumbnail: thumbnailFile?.secure_url,
            owner: req.user._id,
            duration: videoFile?.duration,
            isPublished: true
        }
    )

    if(!video){
        throw new ApiError(500, "Video not created")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {video},
            "Video published successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    video.views += 1;
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {video},
            "Video retrieved successfully"
        )
    
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const {title, description} = req.body;
    
    if(!(title || description)){
        throw new ApiError(400, "Title or description is required")
    }

    const thumbnailFileLocalPath = req.files.thumbnail?.[0]?.path;

    if(!thumbnailFileLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }

    const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath)

    if(!thumbnailFile){
        throw new ApiError(500, "Error uploading thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description,
            thumbnail: thumbnailFile?.secure_url
        },
        {
            new: true
        }
    )

    if(!video){
        throw new ApiError(500, "Error updating video")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {video},
            "Video updated successfully"
        )
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    let video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(500, "Error updating video")
    }

    video.isPublished = !video.isPublished

    await video?.save() 

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {video},
            "Video publish status updated successfully"
        )
    )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}