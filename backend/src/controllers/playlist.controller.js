import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import slugify from "slugify";
import { Playlist } from "../models/playlists.model.js";

const createPlaylist =  asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "title and description both are required");
    }
    const slug = slugify(title, { lower: true, strict: true });

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required");
    }
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail");
    if (!uploadedThumbnail.url) {
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const playList = await Playlist.create({
        name: title,
        title,
        description,
        slug,
        thumbnail: uploadedThumbnail.url,
        owner: req.user._id
    })
    res.status(201).json(new ApiResponse(201, "Playlist created successfully", playList));
})
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "userId is required");
    }
    const playlists = await Playlist.find({ owner: userId });
    if (!playlists || playlists.length === 0) {
        throw new ApiError(404, "User playlists not found");
    }
    res.status(200).json(new ApiResponse(200, "User playlists fetched successfully", playlists));
});
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(400, "playlistId is required");
    }
    const playList = await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }
    res.status(200).json(new ApiResponse(200, "Playlist fetched successfully", playList));
});
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId both are required");
    }
    const playList = await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }
    playList.videos.push(videoId);
    await playList.save();
    res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", playList));
})
const removeVideoFromPlaylist = asyncHandler(async (req,res)=>{
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId both are required");
    }
    const playList = await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }
    playList.videos = playList.videos.filter(
        (vid) => vid.toString() !== videoId.toString()
    );
    await playList.save();
    res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", playList));
})
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(400, "playlistId is required");
    }
    const playList = await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playList.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }
    await Playlist.findByIdAndDelete(playlistId);
    res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
})
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description,thumbnail } = req.body;
    if (!playlistId) {
        throw new ApiError(400, "playlistId is required");
    }
    if (!name && !description && !thumbnail) {
        throw new ApiError(400, "At least one field is required");
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (thumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail");
        if (!uploadedThumbnail.url) {
            throw new ApiError(500, "Failed to upload thumbnail");
        }
        req.body.thumbnail = uploadedThumbnail.url;
    }
    else{
        req.body.thumbnail = thumbnail;
    }

    const playList = await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playList.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    if (name) {
        playList.name = name;
        playList.slug = slugify(name, { lower: true, strict: true });
    }
    if (description) {
        playList.description = description;
    }
    await playList.save();
    res.status(200).json(new ApiResponse(200, "Playlist updated successfully", playList));
})
const getAllPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.find({}).limit(10);
    if (!playlists) {
        throw new ApiError(404, "Playlists not found");
    }
    res.status(200).json(new ApiResponse(200, "Playlists fetched successfully", playlists));
})
export {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    getAllPlaylists
}