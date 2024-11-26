// require('dotenv').config({path: './env'}); //We import all the files so the method looks odd
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
    path: './env'
});
//we change package.json for .env
//-r dotenv/config --experimental-json-modules


connectDB()
.then(()=>{
    //if error occur:
    app.on("error",(err)=>{
        console.log("Server not start",err);
        throw err;
    });
    
    //if no error then listen the app:
    const portNumber= process.env.PORT || 5000;
    app.listen(portNumber,()=>{
        console.log(`Server is running at ${portNumber}`); 
    });
})
.catch((err)=>{
    console.log("MongoDB connection failed !!!",err);
});










/*;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        //listeners
        app.on("error",(err)=>{
            console.log("Not able to talk with DB",err);
            throw err;
        })
        //if all is correct:
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on PORT${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error", error);
        throw error;
        
    }
})()*/