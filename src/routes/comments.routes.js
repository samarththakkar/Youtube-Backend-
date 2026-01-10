import { Router } from "express";
import {
    addVideoComment,
    getVideoComment,
    updateComment,
    deleteComment 
} from "../controllers/comments.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/add-comment/:videoId").post(verifyJWT,addVideoComment);
router.route("/get-comments/:videoId").get(verifyJWT, getVideoComment);
router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

export default router;