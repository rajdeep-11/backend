import mongoose ,{Schema} from mongoose;

const playlistSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    videos : [
        {
            type : Schema.Types.ObjectId,
            ref : "Videos"
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
},{required : true})

export const Playlist = mongoose.models("Playlist", playlistSchema)