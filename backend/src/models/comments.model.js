import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },

    likesCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment", commentSchema);
