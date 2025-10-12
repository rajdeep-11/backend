import { Router } from "express";

import { 
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscriber
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT)

router
    .route("/c/:channelId") 
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscriber)

export default router