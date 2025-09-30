import {Router} from "express";

import {

    loginUser, 
    logOutUser, 
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    currentUser,
    updateUserCredentials,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistroy

} from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//register
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
//routes:
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logOutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/password-change").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, currentUser);

router.route("/update-account").patch(verifyJWT, updateUserCredentials);

router.route("/avatar-update").patch(verifyJWT,upload.single("avatar"),updateAvatar);

router.route("/coverImage-update").patch(verifyJWT, upload.single("coverImage"),updateCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistroy);

export default router;