import {Router} from "express";
import {loginUser, logOutUser, registerUser,refreshAccessToken} from "../controllers/user.controller.js";
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
//logIn
router.route("/login").post(loginUser);
//logOut
router.route("/logout").post(verifyJWT, logOutUser);

//endPoint for new Access token
route.route("/refresh-token").post(refreshAccessToken);
export default router;