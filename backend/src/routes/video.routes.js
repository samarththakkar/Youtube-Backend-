import { Router } from "express";
import { uploadVideo,
    getAllVideos,
    isPublished,
    deleteVideo,
    getVideoById,
    updateVideoDetails,
    userVideos } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();
router.route("/upload-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    verifyJWT, uploadVideo
)
router.route("/update-video/:videoId").patch(
    upload.fields([
        {
            name: "videos",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    verifyJWT, 
    updateVideoDetails
);
router.route("/get-video/:videoId").get(getVideoById);
router.route("/user-videos/:username").get(verifyJWT, userVideos);
router.route("/get-all-videos").get(getAllVideos);  
router.route("/is-published/:videoId").get(verifyJWT,isPublished);
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
export default router;


