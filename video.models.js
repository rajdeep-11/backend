import mongoose,{Schema}  from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema= new Schema({

    videoFile:{
        type: String,   //Cloudnary URL
        required: true
    },
    thumbnil:{
        type: String,
        required: true
    },
    title:{
        type: String,
        require: true
    },
    discription:{
        type: String,
        required: true
    },
    duration:{
        type: Number, //cloudnary or AWS 
        required: true
    },
    views:{
        type: Number,
        defaukt: 0,
        required: true
    },
    Ispublished:{
        type: boolean,
        default: true
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

//add plugin:
videoSchema.plugin(mongooseAggregatePaginate);

export const Video= mongoose.models("Video",videoSchema);
