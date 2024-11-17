// require('dotenv').config({path: './env'}); //We import all the files so the method looks odd
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
});
//we change package.json for .env
//-r dotenv/config --experimental-json-modules


connectDB();










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