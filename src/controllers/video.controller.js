import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

//video file 
//video title    
//video description
//thumbanail
//duration
//views
//isPublished
//owner
//age restriction flag 
const uploadVideo = asyncHandler(async(req,res)=>{
    
    const {title,description} = req.body;

    if(!title || !description){
        throw new ApiError(400,"Title and Description are required");
    }
    let videoLocalPath;
    // const videoLocalPath = req.files?.videoFile[0]?.path
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoLocalPath = req.files.videoFile[0].path;
    }

    if(!videoLocalPath){
        throw new ApiError(400,"Video File is required")
    }

    const uploadVideo = uploadOnCloudinary(videoLocalPath,"video")

    if(!uploadVideo?.url){
        throw new ApiError(500,"Failed to upload video file");
    }   
    let thumbanailLocalPath;
    // const thumbanailLocalPath = req.files?.thumbnail[0]?.path
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbanailLocalPath = req.files.thumbnail[0].path
    }
    const uploadThumbnail = thumbanailLocalPath 
    ? await uploadOnCloudinary(thumbanailLocalPath,"thumbnail") : null;

    const video = await Video.create({
        title,
        description,
        videoFile:uploadVideo.url,
        thumbanail:uploadThumbnail?.url,
        owner:req.user._id,
        duration: uploadVideo.duration || 0
    });
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video uploaded successfully")
);
})

export {uploadVideo}