import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/likes.model.js";
import mongoose from "mongoose";

const addVideoComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    console.log(videoId, content);
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });
    if (!comment) {
        throw new ApiError(500, "Failed to create comment");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Comment create successfully", comment));
});
const getVideoComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
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
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const comments = await Comment.aggregatePaginate(aggregate, {
        page: Math.max(1, Number(page)),
        limit: Math.min(50, Number(limit))
    });

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    );
    if (!updatedComment) {
        throw new ApiError(500, "Failed to update comment");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }
    await Comment.findByIdAndDelete(commentId);
    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user._id
    })
    return res
        .status(200)
        .json(new ApiResponse(200, "Comment deleted successfully", null));
})
export {
    addVideoComment,
    getVideoComment,
    updateComment,
    deleteComment
}