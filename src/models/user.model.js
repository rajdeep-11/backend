import mongoose from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from"bcrypt";


const userSchema= new mongoose.Schema({

    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    fullName:{
        type:String,
        required: true,
        lowercase: true,
        unique: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },

    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"video"
        }
    ],
    password:{
        type: String,
        required:[true, 'Password is required'],
        length: 6
    },
    refreshToken:{
        type: String
    }

},{
    timestamps: true
})

//password Save just before the data Save:

userSchema.pre("save", async function(next){

    // if password is not change:
    if(!this.isModified("password")) return next();

    // change the password:
    this.password= await bcrypt.hash(this.password,10);
    next();

});

// chcek for password [valid or Invalid]:
userSchema.methods.isCorrectPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}
//gentare access token and return it:
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User= mongoose.model("User",userSchema); 