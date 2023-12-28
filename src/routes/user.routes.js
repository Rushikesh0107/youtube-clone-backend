import {Router} from 'express';
import { 
    loginUser, 
    registerUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassowrd, 
    getUserProfile, 
    updateAccoutDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getwatchHistory 
} from '../controller/user.controller.js';
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();


router
.route("/register")
.post(
    upload.fields([
        {
            name: "avatar",
            maxCount : 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser);

router
.route("/login")
.post(loginUser)


//secured routes
router
.route("/logout")
.post(verifyJWT, logoutUser)

//refresh Access Token
router
.route('/refresh-token')
.post(refreshAccessToken)


router
.route("/change-password")
.post(verifyJWT, changeCurrentPassowrd)

router
.route("/current-user")
.get(verifyJWT, getUserProfile);

router
.route('/update-account')
.patch(verifyJWT, updateAccoutDetails)

router
.route('/update-avatar')
.patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

router
.route('/update-cover-image')
.patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)

router
.route('/c/:username')
.get(verifyJWT, getUserChannelProfile)

router
.route('/watchHistory')
.get(verifyJWT, getwatchHistory)

export default router;