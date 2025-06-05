import { driverModels } from "../models/drivers.models.js";
import { otpEmail } from "../services/mailer.js";
import { uploadOnCloudinary } from "../services/uploadOnCloudinary.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Register Driver
export const registerDriver = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      password,
      phoneNumber,
      email,
      dob,
      licenseNumber,
      vehicleType,
      iban,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !password ||
      !phoneNumber ||
      !email ||
      !dob ||
      !licenseNumber ||
      !vehicleType
    ) {
      return res.status(400).json({ message: "Details missing" });
    }

    const existingDriver = await driverModels.findOne({
      $or: [{ phoneNumber }, { email }],
    });

    if (existingDriver) {
      return res
        .status(407)
        .json({ message: "Phone number or E-mail already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const files = req.files;
    if (
      !files ||
      !files.profilePicture ||
      !files.vehicleFrontPicture ||
      !files.licenseCertificatePicture
    ) {
      return res.status(400).json({ message: "All files are required" });
    }

    const profileUpload = await uploadOnCloudinary(
      files.profilePicture[0].path,
      "roam/drivers/profilePictures"
    );
    const vehicleFrontPictureUpload = await uploadOnCloudinary(
      files.vehicleFrontPicture[0].path,
      "roam/drivers/vehicleFrontPictures"
    );
    const licenseCertificatePictureUpload = await uploadOnCloudinary(
      files.licenseCertificatePicture[0].path,
      "roam/drivers/vehicleBackPictures"
    );

    let normalizedVehicleType = "other";
    const miniCars = ["mehran", "alto", "cultus"];
    const standardCars = ["civic", "corolla xli", "corolla gli"];
    if (miniCars.includes(vehicleType.toLowerCase()))
      normalizedVehicleType = "mini";
    else if (standardCars.includes(vehicleType.toLowerCase()))
      normalizedVehicleType = "standard";

    const newDriver = await driverModels.create({
      firstName,
      lastName,
      password: hashedPassword,
      phoneNumber,
      email,
      iban,
      dob: new Date(dob),
      licenseNumber,
      vehicleType: normalizedVehicleType,
      profilePicture: profileUpload.url,
      vehicleFrontPicture: vehicleFrontPictureUpload.url,
      licenseCertificate: licenseCertificatePictureUpload.url,
      status: "pending",
    });

    res.status(200).json({
      message: "Registration complete. You can login after approval",
      newDriver,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login
export const signInDriver = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: "Details missing" });
    }

    const driver = await driverModels.findOne({ phoneNumber });
    if (!driver) {
      return res
        .status(407)
        .json({ message: "Driver not found. Invalid phone number." });
    }

    const isPasswordValid = await bcryptjs.compare(password, driver.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid password" });
    }

    if (driver.status === "pending") {
      return res.status(401).json({ message: "You're not approved yet" });
    }

    const token = jwt.sign({ id: driver._id }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "10d",
    });

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "Driver Logged In", driver, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout
export const logOutDriver = async (req, res) => {
  try {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "Driver logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approved Drivers
export const getAllDrivers = async (req, res) => {
  try {
    const allDrivers = await driverModels.find({ status: "approved" });
    res.status(200).json({ totalDrivers: allDrivers.length, allDrivers });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Pending Drivers
export const getPendingDrivers = async (req, res) => {
  try {
    const pendingDrivers = await driverModels.find({ status: "pending" });
    res
      .status(200)
      .json({ totalDrivers: pendingDrivers.length, pendingDrivers });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await driverModels.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    await otpEmail(email, user.firstName || "User", otp);

    console.log(`OTP for ${email} is ${otp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await driverModels.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await driverModels.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Driver Profile
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const driver = await driverModels.findById(userId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ driver });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Driver Profile
export const updateProfile = async (req, res) => {
  try {
    console.log(req.params)
    const { userId } = req.params;
    const { firstName, email, phoneNumber } = req.body;

    const driver = await driverModels.findById(userId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (firstName) driver.firstName = firstName;
    if (email) driver.email = email;
    if (phoneNumber) driver.phoneNumber = phoneNumber;

    await driver.save();

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      updatedDriver: driver,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllMessages = async (req, res) => {
  console.log(req.body);
  try {
    const { driverId } = req.params;
    if (!driverId) {
      return res.status(404).json({ message: "No driver found" });
    }
    const driver = await driverModels.findById(driverId);
    const driverMessages = driver.adminMessages;
    if (driverMessages.length < 0) {
      return res.status(400).json({
        message: "No messages found",
      });
    }
    return res.status(200).json({
      driverMessages,
      message: "Result",
      totalMessages: driverMessages.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
