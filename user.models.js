import mongoose,{Schema} from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//form encreption we use hooks from mongoose:

const userSchema= new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true,
        index: true   //for seraching filed enable
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true   //for seraching filed enable
    },
    avatar:{
        type: String, //cloudnary
        required: true,
    },
    coverImage:{
        type: String,
    },
    watchHistoty:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password:{
        type: String, 
        required: [true,'Password is required']
    },
    refreshTokena:{
        type:String
    }
    
}, {timestamps: true});


// Not use arrow function{don't have the access of this keyword}:
userSchema.pre("save", async function(next){
    //access the password:

    //hash(what will be hashed ,rounds)

    if(!this.isModeified("password")) return next();

    this.password=bcrypt.hash(this.password,10);
    next();
});


//Methods 
userSchema.methods.isPasswordCorrect=async function(password) {
    //check the given password and db stored password:
    //return true and false:
    return await bcrypt.compare(password,this.password);
};

//Access token genrate:
userSchema.methods.genrateAccessToken=async function(){

    return jwt.sign(
        {
        _id: this._id,
        email: this.email,
        userName:this.username,
        fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
};
//Refresh token genrate:
userSchema.methods.genrateAccessToken=function(){
    jwt.sign(
        {
        _id: this._id,
        email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
};

export const User= mongoose.model("User",userSchema);
