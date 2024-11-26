import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app= express();

//app.use() used from configs and middlewares:
app.use(cors({
    origin : process.env.CORS_ORIGIN,
   credential: true
}));

//set the formate of files:

app.use(express.json({limit:"15kb"}));

app.use(express.urlencoded({extended: true,limit: "16kb"}));//to handle URL encoer[' '->%20,+ etc.]:
app.use(express.static("public"));//save image, folder etc. at own server:
app.use(cookieParser()); // porform CRED operation in User cookie:

//import the routers:
import userRouter from "./routes/user.routes.js";


//routes declaration:
app.use("/api/v1/users", userRouter);

export {app}; 
