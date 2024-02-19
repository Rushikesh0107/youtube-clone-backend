import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment
} from "../controller/comment.controller.js";


const router = express.Router();

router.route("/add-comment").post(verifyJWT, addComment)

router.route("/get-comments/:videoId").get(verifyJWT, getVideoComments)

router.route("/update-comment/:commentId").patch(verifyJWT, updateComment)

router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment)


export default router;