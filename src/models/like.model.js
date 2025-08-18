import mongoose, {Schema} from mongoose;

const likeSchema = new mongoose.Schema({
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },

    comment :{
        type : Schema.Types.ObjectId,
        ref : "Comment"
    },

    tweet :{
        type : Schema.Types.ObjectId,
        ref : "Tweet"
    },

    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
}, {timeStamsp : true})

export const likes = mongoose.model("Like", likeSchema)