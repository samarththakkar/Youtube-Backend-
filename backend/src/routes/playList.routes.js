import { Router } from "express";
import { createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    getAllPlaylists } from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(
    upload.fields([
        {
            name:"thumbnail",
            maxCount:1
        }
    ])
,verifyJWT,createPlaylist);
router.route("/get-playlist/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/user-playlists/:userId").get(verifyJWT, getUserPlaylists);
router.route("/add-video/:playlistId/:videoId").post(verifyJWT, addVideoToPlaylist);
router.route("/remove-video/:playlistId/:videoId").post(verifyJWT, removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/update-playlist/:playlistId").patch(
    upload.fields([
        {
            name:"thumbnail",
            maxCount:1
        }
    ])
,verifyJWT, updatePlaylist);
router.route("/all-playlists").get(verifyJWT, getAllPlaylists);

export default router;