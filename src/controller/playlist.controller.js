import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!(name && description)){
        throw new ApiError(400, "Please provide name and description")
    }

    const playlist = await Playlist.create({
        name,
        description,
        userId: req.user._id
    })

    if(!playlist){
        throw new ApiError(500, "Playlist not created")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {playlist},
            "Playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const playlists = await Playlist.findById({userId})

    if(!playlists){
        throw new ApiError(404, "No playlist found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlists},
            "Playlists fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "No playlist found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlist},
            "Playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findByIdAndRemove(
        playlistId,
        {
            $push: {
                videos : videoId
            }
        },
        {
            new: true
        }
    )

    if(!playlist){
        throw new ApiError(500, "Video not added to playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlist},
            "Video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos : videoId
            }
        },
        {
            new: true
        }
    )

    if(!playlist){
        throw new ApiError(500, "Video not removed from playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlist},
            "Video removed from playlist successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(500, "Playlist not deleted")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {
            new: true
        }
    )

    if(!playlist){
        throw new ApiError(500, "Playlist not updated")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlist},
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
