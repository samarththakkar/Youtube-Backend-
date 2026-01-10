import { Router } from "express";
import {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets,
    getAllTweets
} from "../controllers/tweets.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT,createTweet)
router.route("/user-tweets/:user_id").get(getUserTweets);
router.route("/all-tweets").get(getAllTweets);
router.route("/update-tweet/:tweet_id").patch(verifyJWT,updateTweet);
router.route("/delete-tweet/:tweet_id").delete(verifyJWT,deleteTweet);

export default router;