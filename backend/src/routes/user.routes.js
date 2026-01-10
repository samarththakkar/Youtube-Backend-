import { Router } from "express";
import passport from "../config/passport.js";
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    sendOTPForRegistration,
    verifyOTPForRegistration,
    updateAccountDetails, 
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
    forgotOTPForPassword,
    resetPasswordUsingOTP,
    generateAccessAndRefreshTokens
} from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();



router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

//OAuth routes - redirect to provider login pages
router.route("/auth/google").get(
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.route("/auth/google/callback").get(
    passport.authenticate('google', { session: false }),
    async (req, res) => {
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(req.user._id);
        const options = { httpOnly: true, secure: true };
        
        res.cookie("accessToken", accessToken, options)
           .cookie("refreshToken", refreshToken, options)
           .redirect(`${process.env.CLIENT_URL}/dashboard?login=success`);
    }
);

router.route("/auth/facebook").get(
    passport.authenticate('facebook', { scope: ['email'] })
);

router.route("/auth/facebook/callback").get(
    passport.authenticate('facebook', { session: false }),
    async (req, res) => {
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(req.user._id);
        const options = { httpOnly: true, secure: true };
        
        res.cookie("accessToken", accessToken, options)
           .cookie("refreshToken", refreshToken, options)
           .redirect(`${process.env.CLIENT_URL}/dashboard?login=success`);
    }
);

//secured routes
router.route("/logout").post( verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);
router.route("/watch-history").get(verifyJWT, getWatchHistory);
// OTP routes
router.route("/forgot-password").post(forgotOTPForPassword);
router.route("/reset-password").post(resetPasswordUsingOTP);
router.route("/send-otp").post(sendOTPForRegistration);
router.route("/verify-otp").post(verifyOTPForRegistration);

export default router;