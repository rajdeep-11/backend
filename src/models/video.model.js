import mongoose,{Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String, //cloudinary URL
        required: true
    },
    thumbnil:{
        type:String, //cloudinary URL
        required: true
    },
    title: {
        type: String, 
        required: true
    },
    disciption: {
        type: String, 
        required: true
    },
    duration: {
        type: Number, 
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{
    timestamps: true
});

videoSchema.plugin(mongooseAggregatePaginate);

export const video= mongoose.model("video", videoSchema);