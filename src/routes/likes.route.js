import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
    getLikedVideos,
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
} from '../controller/likes.controller.js'

const router = express.Router()

router.route("/get-liked-videos").get(verifyJWT, getLikedVideos)

router.route("/toggle-video-like/:videoId").post(verifyJWT, toggleVideoLike)

router.route("/toggle-comment-like/:commentId").post(verifyJWT, toggleCommentLike)

router.route("/toggle-tweet-like/:tweetId").get(verifyJWT, toggleTweetLike)

export default router