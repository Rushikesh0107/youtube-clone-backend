import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    publishAVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoById,
    getAllVideos
} from "../controller/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

const router  = express.Router()

router.route("/upload-video").post(verifyJWT, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), publishAVideo);

router.route("/update-video/:videoId").patch(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    }
]), updateVideo);

router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);

router.route("/toggle-publish-status/:videoId").patch(verifyJWT, togglePublishStatus)

router.route("/get-video/:videoId").get(verifyJWT, getVideoById)

router.route("/get-all-videos").get(verifyJWT, getAllVideos)



export default router