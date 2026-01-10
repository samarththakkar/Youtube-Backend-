import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweets.model.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

const createTweet = asyncHandler(async(req,res)=>{

    const {content} = req.body;
    if(!content){
        throw new ApiError(400, "Text is required");
    }
    
    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id 
    });
    if(!tweet){
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet));
})

const updateTweet = asyncHandler(async(req, res)=>{
    const {tweet_id} = req.params;
    const {content} = req.body;
    if(!content){
        throw new ApiError(400, "Text is required");
    }
    if(!isValidObjectId(tweet_id)){
        throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findById(tweet_id);
    if(!tweet){
        throw new ApiError(500, "Tweet not found!");
    }
    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not authorized to update this tweet");
    }
    const newTweet = await Tweet.findByIdAndUpdate(tweet_id,
    {
        $set:{
            content: content
        },
    },{new:true}
    )
    if(!newTweet){
        throw new ApiError(500, "Something went wrong while updating tweet");
    }
    tweet.content = content;
    await tweet.save();

    res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", newTweet));
})
const deleteTweet = asyncHandler(async(req, res)=>{
    const {tweet_id} = req.params;
    if(!isValidObjectId(tweet_id)){
        throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findByIdAndDelete(tweet_id);
    if(!tweet){
        throw new ApiError(500, "Something went wrong while deleting tweet");
    }
    res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", tweet));
})
const getUserTweets = asyncHandler(async(req, res)=> {
    const {user_id} = req.params;
    console.log(user_id)
    if (!user_id) {
        throw new ApiError(400, "User ID is required");
    }
    const tweets = await Tweet.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(user_id) }
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
    
    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});
const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Number(limit));

    const aggregate = Tweet.aggregate([
        {
            $match: {
                isDeleted: { $ne: true }
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
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const tweets = await Tweet.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    });

    res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    );
});

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets,
    getAllTweets
}