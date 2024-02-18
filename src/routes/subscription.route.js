import express from 'express';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controller/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = express.Router();

router.route("/subscribe-button/:channelId").post(verifyJWT, toggleSubscription);

router.route("/subscribers/:channelId").get(verifyJWT, getUserChannelSubscribers);

router.route("/subscribed-channels/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;