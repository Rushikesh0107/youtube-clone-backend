import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from '../controller/tweet.controller.js'

const router = express.Router() 

router.route("/add-tweet").post(verifyJWT, createTweet)

router.route("/get-tweets/:userId").get(verifyJWT, getUserTweets)

router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet)

router.route("/update-tweet/:tweetId").patch(verifyJWT, updateTweet)

export default router