import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        //file has been uploaded successfully
        // console.log("File uploaded successfully", response.url);

        fs.unlinkSync(localFilePath); //removes the locally saved temporary file

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //removes the locally saved temporary file as the upload operation fails
        return null;
    }
}




export {uploadOnCloudinary};


