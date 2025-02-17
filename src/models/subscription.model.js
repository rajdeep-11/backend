import mongoose,{Schema} from "mongoose";

const subscriptionSchema= new mongoose.Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //user who is subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId, //user who owns the channel
        ref: "User"
    }
},{
    timestamps: true
});

export const Subscription=mongoose.model("Subscription",subscriptionSchema);