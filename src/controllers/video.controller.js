import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import slugify from "slugify";


const uploadVideo = asyncHandler(async (req,res) => {
    const {title , description, category} = req.body;
    if(!title || !description){
        throw new ApiError (400, "Title and Description are required");
    }
    const videoLocalPath = await req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = await req.files?.thumbnail[0]?.path;

    if(!videoLocalPath){
        throw new ApiError (400, "Video file is required");
    }
    if(!thumbnailLocalPath){
        throw new ApiError (400, "Thumbnail is required");
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const slug = slugify(title, {lower: true, trim: true});

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        category: category || 'Other',
        owner: req.user._id,
        isPublished: false,
        views: 0,
        slug
    });
    const videoUploaded = await Video.findById(video.id);
    if(!videoUploaded){
        throw new ApiError (500, "Something went wrong while uploading the video");
    }
    res
    .status(201)
    .json(new ApiResponse(201, "Video uploaded successfully", videoUploaded));
})
const getAllVideos = asyncHandler(async (req,res) => {
    
    const {page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId, category} = req.query;
    
    const searchQuery = query?.trim() || "";
    
    const filter = {
        isPublished: true,
        $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } }
        ]
    };

    if(userId){
        filter.owner = userId;
    }
    if(category){
        filter.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit);

    const totalVideos = await Video.countDocuments(filter);

    if(!videos?.length){
        throw new ApiError(404, "No videos found");
    }
    res.status(200)
        .json(new ApiResponse(
            200,
            "Videos fetched successfully",
            {
                videos,
                totalVideos,
                currentPage: page,
                totalPages: Math.ceil(totalVideos/limit)
            }
        ));
})
const isPublished = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this video");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    res.status(200)
        .json(new ApiResponse(200, `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`, video));
})
const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this video");
    }
    
    // Delete from Cloudinary
    const videoPublicId = extractPublicId(video.videoFile);
    const thumbnailPublicId = extractPublicId(video.thumbnail);
    
    await deleteFromCloudinary(videoPublicId, "video");
    await deleteFromCloudinary(thumbnailPublicId, "image");
    
    await Video.findByIdAndDelete(videoId);
    res.status(200)
        .json(new ApiResponse(200, "Video deleted successfully"));
}
);
const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(!video.isPublished){
        throw new ApiError(403, "Video is not published");
    }
    res.status(200)
        .json(new ApiResponse(200, "Video fetched successfully", video));
}
);
const updateVideoDetails = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this video");
    }
    const videoLocalPath = req.files?.videos?.[0]?.path;
    if(videoLocalPath){
        const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
        video.videoFile = uploadedVideo.url;
        video.duration = uploadedVideo.duration;
    }
    const {title, description, category} = req.body;
    if(title){
        video.title = title;
        video.slug = slugify(title, {lower: true, trim: true});
    }
    if(description){
        video.description = description;
    }
    if(category){
        video.category = category;
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(thumbnailLocalPath){
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        video.thumbnail = uploadedThumbnail.url;
    }
    await video.save();
    res.status(200)
        .json(new ApiResponse(200, "Video details updated successfully", video));
}
);
const userVideos = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const aggregate = Video.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $match: {
                "owner.username": username,
                isPublished: true
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const videos = await Video.aggregatePaginate(aggregate, options);

    res.status(200).json(
        new ApiResponse(200, "User videos fetched successfully", videos)
    );
});

export {
    uploadVideo,
    getAllVideos,
    isPublished,
    deleteVideo,
    getVideoById,
    updateVideoDetails,
    userVideos
}