import { adminsModel } from "../models/admins.models.js";
import bcryptjs from "bcryptjs";
import { uploadOnCloudinary } from "../services/uploadOnCloudinary.js";
import jwt from "jsonwebtoken";
import { driverModels } from "../models/drivers.models.js";
import { approvalEmail, rejectionEmail } from "../services/mailer.js";
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(404).json({ message: "Provide all details please" });
    }
    const existingUser = await adminsModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exist" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const files = req.files;
    const localPath = files.profilePicture[0].path;
    if (!localPath) {
      res
        .status(400)
        .json({ message: "Profile picture file missing", success: false });
      return;
    }
    const response = await uploadOnCloudinary(
      localPath,
      "roam/admins/profilepicture"
    );
    console.log(response);
    const user = await adminsModel.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: response.url,
    });
    return res
      .status(200)
      .json({ message: "Admin registration completed", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal server error " });
  }
};
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({ message: "Provide all details please" });
    }
    const admin = await adminsModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found invalid email" });
    }
    const isPasswordValid = await bcryptjs.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "10d",
    });
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("token", token, options)
      .json({ message: "admin logged in", admin });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const logOut = async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(201)
    .clearCookie("token", options)
    .json({ message: "User logged Out" });
};

export const approveDriver = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "No Id provided" });
    }
    const driver = await driverModels.findById(id);
    if (!driver) {
      return res.status(404).json({ message: "No driver found" });
    }
    driver.status = "approved";
    await driver.save();
    approvalEmail(driver.email, driver.fullName);
    return res.status(200).json({ message: "driver approved", driver });
  } catch (error) {
    console.log("approval error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const rejectDriver = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "No Id provided" });
    }
    const driver = await driverModels.findByIdAndDelete(id);
    if (!driver) {
      return res.status(404).json({ message: "No driver found" });
    }
    rejectionEmail(driver.email, driver.fullName);
    return res.status(200).json({ message: "Driver Deleted", driver });
  } catch (error) {
    console.error("Rejecting error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminsModel.find();
    res.status(200).json({ admins });
  } catch (error) {
    console.log(error);
  }
};
export const sendMessageToDriver = async (req, res) => {
  try {
    const { message, driverId } = req.body;
    if (!message || !driverId ) {
      return res.status(400).json({ message: "Details missings" });
    }
    const driver = await driverModels.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    driver.adminMessages.push({
      message,
    });
    await driver.save();
    return res.status(200).json({ message: "Message sent", message });
  } catch (error) {
    console.log(error);
  }
};
