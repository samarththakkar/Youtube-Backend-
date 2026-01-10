import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      default: null
    },

    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      default: null
    },

    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

likeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like", likeSchema);
