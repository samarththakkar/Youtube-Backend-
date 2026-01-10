import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscriber.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/toggle/:channelId", verifyJWT, toggleSubscription);
router.get("/subscribers/:channelId", verifyJWT, getUserChannelSubscribers);
router.get("/subscribed-channels/:subscriberId", verifyJWT, getSubscribedChannels);

export default router;