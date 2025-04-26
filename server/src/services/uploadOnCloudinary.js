import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dp1y5427n",
  api_key:476943144449955,
  api_secret: "EMaAzWIyy2TsJ4nbFN_WhXH47bI",
});

export const uploadOnCloudinary = async (localPath, folderName) => {
  try {
    if (!localPath) {
      console.log("No Local file path or folder received in Cloudinary");
      return null;
    }
    const response = await cloudinary.uploader.upload(localPath, {
      folder: folderName,
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    console.log("Cloudinary Upload Error:", error.message);
    return null;
  } finally {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
};
