import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
    try {
        if(!localFilePath) return null

        // upload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: resourceType === "video" ? "video" : "auto"
        })

        //file has been uploaded successfully
        // console.log("file is uploaded on cloudinary",response.url);
        
        // Clean up the temporary file after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return response;

    } catch (error) {
        // Clean up the temporary file even if upload failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null;
    }
}


const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
    try {
        if (!publicId) return null;
        
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        
        return response;
    } catch (error) {
        console.log("Error deleting from cloudinary:", error);
        return null;
    }
}

const extractPublicId = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
}

export {uploadOnCloudinary, deleteFromCloudinary, extractPublicId}