import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import slugify from "slugify";


const uploadVideo = asyncHandler(async (req, res) => {3
    //video file 
    //video title    
    //video description
    //thumbanail
    //duration
    //views
    //isPublished
    //owner
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required");
    }
    const slug = slugify(title, { lower: true, strict: true });
    
    let videoLocalPath;
    // const videoLocalPath = req.files?.videoFile[0]?.path

    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoLocalPath = req.files.videoFile[0].path;
    }

    if (!videoLocalPath) {
        throw new ApiError(400, "Video File is required")
    }

    const uploadVideo = await uploadOnCloudinary(videoLocalPath, "video")
    // console.log(uploadVideo)
    if (!uploadVideo.url) {
        throw new ApiError(500, "Failed to upload video file");
    }

    let thumbnailLocalPath;
    // const thumbanailLocalPath = req.files?.thumbnail[0]?.path
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnai is required")
    }
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail");
    if (!uploadThumbnail.url) {
        throw new ApiError(400, "Failed to upload thumbnail file")
    }

    const video = await Video.create({
        title,
        slug,
        description,
        videoFile: uploadVideo.url,
        thumbnail: uploadThumbnail.url,
        owner: req.user._id,
        duration: uploadVideo.duration || 0
    });
    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video uploaded successfully")
        );
})
const updateVideo = asyncHandler(async (req, res) => {
    //change video file
    //change thumbnail
    //change title 
    //change description
    //ownership check 
    const { slug } = req.params;
    const { title, description } = req.body;
    // if(!mongoose.Types.ObjectId.isValid(videoId))
    // {
    //     throw new ApiError(400,"Invalid video id");
    // }
    const video = await Video.findOne({ slug });
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }
    if (title) {
        video.title = title;
        video.slug = slugify(title, { lower: true, strict: true });
    }
    if (description) video.description = description;
    

    if (req.files?.videoFile?.length > 0) {
        const videoLocalPath = req.files.videoFile[0].path;
        const uploadedVideo = await uploadOnCloudinary(videoLocalPath, "video");
        if (!uploadedVideo?.url) {
            throw new ApiError(500, "Failed to update new video");
        }
        video.videoFile = uploadedVideo.url;
        video.duration = uploadedVideo.duration || video.duration;
    }

    if (req.files?.thumbnail?.length > 0) {
        const thumbnailLocalPath = req.files.thumbnail[0].path;
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumnail");
        if (!uploadedThumbnail?.url) {
            throw new ApiError(500, "Failed to update new thumbnail");
        }
        video.thumbnail = uploadedThumbnail.url;
    }
    video.save();
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
})
const deleteVideo = asyncHandler(async (req, res) => {
    const {slug} = req.params;
    const video = await Video.findOne({ slug });
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }
    await video.remove();
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"));
})
const getAllVideos = asyncHandler(async (req, res) => {
    const video = await Video.find();
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
})
const getUserVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({ owner: req.user._id });
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "User videos fetched successfully"));
})
const incrementViewCount = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const video = await Video.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "View count incremented successfully"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const video = await Video.findOne({ slug });
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this video");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video publish status updated"));
})
const unPublishVideo = asyncHandler(async (req, res) => {  
    const { slug } = req.params;
    const video = await Video.findOne({ slug });
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this video");
    }
    if(video.isPublished != false){
        video.isPublished = false;
    }
    await video.save();
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video unpublished successfully"));
})



export {
    uploadVideo,
    updateVideo,
    deleteVideo,
    getAllVideos,
    getUserVideos,
    incrementViewCount,
    togglePublishStatus,
    unPublishVideo
}