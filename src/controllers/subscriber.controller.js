import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { subscriberId } = req.user._id;
    if (!channelId) {
        throw new ApiError(400, "Channel Id is required");
    }
    const subscribed = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });
    if (subscribed) {
        await Subscription.findByIdAndDelete(subscribed._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed Successfully"));
    }
    const newSubscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });
    if (!newSubscription) {
        throw new ApiError(500, "Unable to subscribe, please try again later");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscribed Successfully"));
});
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!channelId) {
        throw new ApiError(400, "Channel id is required");
    }

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Number(limit));

    const aggregate = Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: { $first: "$subscriber" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const subscribers = await Subscription.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    });
    if (!subscribers) {
        throw new ApiError(500, "Unable to fetch subscribers, please try again later");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Number(limit));

    const aggregate = Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
                channel: { $first: "$channel" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const subscribedChannels = await Subscription.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}