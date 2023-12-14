import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';

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

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is required")
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
        "-password -refreshToken"
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
        const user = User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
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

    const isPasswordCorreect = await user.comparePassword(password)

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
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})


export {
    registerUser,
    loginUser, 
    logoutUser
}