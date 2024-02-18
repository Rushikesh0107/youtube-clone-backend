import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
} from "../controller/playlist.controller.js"

const router = express.Router()

router.route("/cerate-playlist").post(verifyJWT, createPlaylist)

router.route("/get-user-playlists").get(verifyJWT, getUserPlaylists)

router.route("/get-playlist/:playlistId").get(verifyJWT, getPlaylistById)

router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist)

router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist)

router.route("/add-video-to-playlist/:playlistId").patch(verifyJWT, addVideoToPlaylist)

router.route("/remove-video-from-playlist/:playlistId").patch(verifyJWT, removeVideoFromPlaylist)

export default router