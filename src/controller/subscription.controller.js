import  {Types, isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription


    //check if invalid channel id
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel id is required")
    }
    const userId = req.user._id;

    //check if channel is not available
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }

    //prevent subcribing to own channel
    if(channelId.toString() === userId){
        throw new ApiError(400, "You can't subscribe to your own channel")
    }

    //toggle subscrition

    const subscription = await Subscription.findOne(
        {
            channel: channelId,
            subscriber: userId
        }
    );

    let unsubscribe;
    let subscribe;

    if(subscription?.subscriber.toString() === userId.toString()){
        unsubscribe = await Subscription.findOneAndDelete({
            channel: channelId,
            subscriber: userId
        })
    } else {
        subscribe = await Subscription.create({
            channel: channelId,
            subscriber: userId
        })
    }

    console.log(subscription);
    console.log(unsubscribe);
    console.log(subscribe);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            `${unsubscribe ? "Unsubscribed" : "Subscribed"} successfully`
        )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel id is required")
    }

    //console.log(channelId);

    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }

    const data = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: new Types.ObjectId(channelId)
                }
            },
            {
                $lookup: {
                    from : "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscribers",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullname: 1,
                                avatar: 1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    subscribers: {
                        $first: "$subscribers"
                    }
                }
            },
            {
                $project: {
                    subscribers: 1,
                    _id: 0
                
                }
            }
        ]
    )

    let list = [];

    data.map(sub => list.push(sub.subscribers))

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            list,
            "List of subscribers"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Subscriber id is required")
    }

    const user = await User.findById(subscriberId)
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const subscribedTo = await Subscription.aggregate(
        [
            {
                $match: {
                    subscriber: new Types.ObjectId(subscriberId),
                }
            },
            {
                $group: {
                    _id: null,
                    channels: {
                        $push: "$channel"
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channels",
                    foreignField: "_id",
                    as: "subscribedTo",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullname: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    subscribedTo: 1,
                }
            }
        ]
    )

    // console.log(subscribedTo);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribedTo,
            "List of channels subscribed to"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}