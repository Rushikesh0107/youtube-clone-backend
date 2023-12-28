import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res, next) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar to cloudinary check
    // craete user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response


    const {fullname, username, email, password} = req.body
    console.log("email:", email);

    if(
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    //console.log(req.files);

    if(existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is required")
    }

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // upload images to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar File is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const craetedUser = await User.findById(user._id).select(
        "-password"
    )

    if(!craetedUser) {
        throw new ApiError(500, "Something wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, craetedUser, "User registered successfully")
    )
})

const generateAccessAndRefereshToken = async (userId) => {
    // generate access token
    // generate refresh token
    // save refresh token in db
    // return access token and refresh token

    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, error)
    }
}

const loginUser = asyncHandler (async (req, res) => {
    //get req.body => data
    // username and email
    //find user in db
    // check password
    // generate access token and refresh token
    // send cookies

    const {username, email, password} = req.body

    if(!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(401, "Invalid credentials")
    }

    const isPasswordCorreect = await user.isPasswordCorrect(password)

    if(!isPasswordCorreect) {
        throw new ApiError(401, "Invalid credentials")
    }

    const {accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id)

    // from here the response process starts

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200,
            loggedInUser, accessToken, refreshToken,
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        }, 
        {
            new: true
        })

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken",  option)
    .json(
        new ApiResponse(
            200,
             {},
            "User logged out successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken;
    console.log("incommingRefreshToken:", incommingRefreshToken);

    if(!incommingRefreshToken) {
        throw new ApiError(401, "Unauthenticated")
    }

   try {
     const decoded = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decoded._id)
 
     if(!user) {
         throw new ApiError(401, "Unauthenticated")
     }

     console.log("user", user);
 
     if(incommingRefreshToken !== user.refreshToken) {
         throw new ApiError(401, "Refresh token is used or expired")
     }
 
     const {accessToken, newRefreshToken } = await generateAccessAndRefereshToken(user._id)
 
     const option = {
         httpOnly: true,
         secure: true
     }
 
     return res
     .status(200)
     .cookie("accessToken", accessToken, option)
     .cookie("refreshToken", newRefreshToken, option)
     .json(
         new ApiResponse (200, {accessToken, refreshToken : newRefreshToken }, "Acccess token refreshed successfully")
     )
   } catch (error) {
       throw new ApiError(401, error.message || "Invalid refresh token")
    
   }
})

const changeCurrentPassowrd = asyncHandler(async (req, res) => {
    const {currentPassword, newPassword} = req.body;

    if(!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required")
    }

    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid current password")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )

})

const getUserProfile = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "User profile fetched successfully")
    )
})

const updateAccoutDetails = asyncHandler(async (req, res) => {
    const {fullname, email} = req.body

    if(!fullname || !email) { 
        throw new ApiError(400, "Fullname and email are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        200,
        user,
        "User details updated successfully"
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0].path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar?.url) {
        throw new ApiError(400, "Error while uploading avatar file")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        200,
        user,
        "User avatar updated successfully"
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage?.url) {
        throw new ApiError(400, "Error while uploading cover image file")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        200,
        user,
        "User cover image updated successfully"
    )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if(!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowercase()
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subcribersCount: {
                    $size: '$subscribers'
                },
                channelSubscribedToCount: {
                    $size: '$subscribedTo'
                },
                isSubscribed: {
                    cond: {
                        if: {$in: [req.user?._id, '$subscribers.subscriber']},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subcribersCount: 1,
                channelSubscribedToCount: 1, 
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])

    if(!channel?.length) {
        throw new ApiError(404, "Channel not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    )
})   

const getwatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            },
        },    
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner'
                            }
                        }
                    }
                ]

            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user[0].watchHistory, 
            "Watch history fetched successfully"
        )
    )
})


export {
    registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changeCurrentPassowrd,
    getUserProfile,
    updateAccoutDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getwatchHistory
}