import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary= async (localFilePath)=>{
    try {
        
        if(!localFilePath) return null;

        //Upload the file:
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //if file has been uploaded successfull:
        //console.log("file is uploaded on cloudinary ", response.url);

        fs.unlinkSync(localFilePath); // if files upload sucessfilly then remove from local storage
        return response;

    } catch (error) {
        //if upload fails than removed the locally saved file;
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadCloudinary};