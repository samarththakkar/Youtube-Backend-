import { Like } from "../models/likes.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.model.js";
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const removedLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })
    if (removedLike) {
        await Like.findByIdAndDelete(removedLike._id);
        const updatedVideo = await Video.findByIdAndUpdate(videoId,
            { $inc: { likesCount: -1 } },
            { new: true }
        );
        return res.status(200).json(
            new ApiResponse(200, { likesCount: updatedVideo.likesCount }, "Video unliked successfully")
        )
    }
    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })
    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        { $inc: { likesCount: 1 } },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, { likesCount: updatedVideo.likesCount }, "Video liked successfully")
        )

})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "Comment id is required")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    const removedLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })
    if (removedLike) {
        await Like.findByIdAndDelete(removedLike._id);
        const updatedComment = await Comment.findByIdAndUpdate(commentId,
            { $inc: { likesCount: -1 } },
            { new: true }
        );
        return res.status(200).json(
            new ApiResponse(200, { likesCount: updatedComment.likesCount }, "Comment unliked successfully")
        )
    }
    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })
    const updatedComment = await Comment.findByIdAndUpdate(commentId,
        { $inc: { likesCount: 1 } },
        { new: true }
    )
    return res
        .status(200)
        .json(new ApiResponse(200, { likesCount: updatedComment.likesCount }, "Comment liked successfully"))
})
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const removedLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    });
    if (removedLike) {
        await Like.findByIdAndDelete(removedLike._id);
        const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
            { $inc: { likesCount: -1 } },
            { new: true }
        );
        return res.status(200).json(
            new ApiResponse(200, { likesCount: updatedTweet.likesCount }, "Tweet unliked successfully")
        )
    }
    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $inc: { likesCount: 1 }
    }, { new: true })
    return res.status(200).json(
        new ApiResponse(200, { likesCount: updatedTweet.likesCount }, "Tweet liked successfully")
    )
});
const getLikedVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Number(limit));

    const aggregate = Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },
        {
            $match: {
                "video.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.owner",
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
                "video.owner": { $first: "$video.owner" }
            }
        },
        {
            $replaceRoot: {
                newRoot: "$video"
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const likedVideos = await Like.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    });

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}
