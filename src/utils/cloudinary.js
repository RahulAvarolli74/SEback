import cloudinary from 'cloudinary'
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure your Cloudinary credentials in .env
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        
        // Remove file from local temp folder
        fs.unlinkSync(localFilePath);
        
        return response.url; // This is the STRING you need

    } catch (error) {
        // Remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath); 
        return null;
    }
}

export { uploadOnCloudinary };