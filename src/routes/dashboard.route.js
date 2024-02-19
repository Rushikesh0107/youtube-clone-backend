import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    getChannelStats,
    getChannelVideos
} from "../controller/dashboard.controller.js"

const router = express.Router()

router.route("/:channelId/stats").get(verifyJWT, getChannelStats)

router.route("/:channelId/videos").get(verifyJWT, getChannelVideos)

export default router