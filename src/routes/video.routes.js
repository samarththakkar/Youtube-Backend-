import { Router } from "express";
import { deleteVideo, getAllVideos, getUserVideos, incrementViewCount, togglePublishStatus, unPublishVideo, updateVideo, uploadVideo } from "../controllers/video.controller.js";
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
router.route("/update/:slug").patch(
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
    verifyJWT,
    updateVideo
)
router.route("/delete-video/:slug").delete(verifyJWT, deleteVideo);
router.route("/get-all-videos").get(getAllVideos);  
router.route("/get-user-videos").get(verifyJWT, getUserVideos);
router.route("/increment-views/:slug").patch(incrementViewCount);
router.route("/published/:slug").patch(verifyJWT,togglePublishStatus)
router.route("/un-publish-video/:slug").patch(verifyJWT,unPublishVideo)
export default router;


