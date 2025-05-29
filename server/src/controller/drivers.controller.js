import { driverModels } from "../models/drivers.models.js";
import { registrationEmail } from "../services/Mailer.js";
import { uploadOnCloudinary } from "../services/uploadOnCloudinary.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerDriver = async (req, res) => {
  console.log("received req o");
  try {
    console.log("received req");
    const {
      firstName,
      lastName,
      password,
      phoneNumber,
      email, // ✅ Added missing email
      ibanNumber,
      dob,
      licenseNumber,
      vehicleType,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !password ||
      !phoneNumber ||
      !email || // ✅ Added to validation
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
      return res.status(407).json({ message: "Phone number or E-mail already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const files = req.files;
    if (
      !files ||
      !files.profilePicture ||
      !files.vehicleFrontPicture ||
      !files.licenseCertificatePicture
    ) {
      console.log("error 3");
      return res.status(400).json({ message: "All files are required" });
    }

    const profilePath = files.profilePicture[0].path;
    const vehicleFrontPicture = files.vehicleFrontPicture[0].path;
    const licenseCertificatePicture = files.licenseCertificatePicture[0].path;

    const profileUpload = await uploadOnCloudinary(
      profilePath,
      "roam/drivers/profilePictures"
    );
    const vehicleFrontPictureUpload = await uploadOnCloudinary(
      vehicleFrontPicture,
      "roam/drivers/vehicleFrontPictures"
    );
    const licenseCertificatePictureUpload = await uploadOnCloudinary(
      licenseCertificatePicture,
      "roam/drivers/vehicleBackPictures"
    );

    // ✅ VehicleType Normalization
    let normalizedVehicleType = "other";
    const miniCars = ["mehran", "alto", "cultus"];
    const standardCars = ["civic", "corolla xli", "corolla gli"];
    if (miniCars.includes(vehicleType.toLowerCase())) {
      normalizedVehicleType = "mini";
    } else if (standardCars.includes(vehicleType.toLowerCase())) {
      normalizedVehicleType = "standard";
    }

    const newDriver = await driverModels.create({
      firstName,
      lastName,
      password: hashedPassword,
      phoneNumber,
      email,
      ibanNumber, // ✅ Optional - if required
      dob: new Date(dob),
      licenseNumber,
      vehicleType: normalizedVehicleType,
      profilePicture: profileUpload.url,
      vehicleFrontPicture: vehicleFrontPictureUpload.url,
      licenseCertificate: licenseCertificatePictureUpload.url,
      status: "pending",
    });

    registrationEmail(email, firstName);
    res.status(200).json({
      message: "Registration complete. You can login after approval",
      newDriver,
    });
  } catch (error) {
    console.log(error.message);
    console.log("error 4");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signInDriver = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: "Details missing" });
    }

    const driver = await driverModels.findOne({ phoneNumber });
    if (!driver) {
      return res.status(407).json({ message: "Driver not found. Invalid phone number." });
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

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ Works for dev/prod
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ message: "Driver Logged In", driver, token }); // ✅ Optionally return token
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const logOutDriver = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅
    };
    res
      .status(200)
      .clearCookie("token", options)
      .json({ message: "Driver logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAllDrivers = async (req, res) => {
  try {
    const allDrivers = await driverModels.find({ status: "approved" });
    res.status(200).json({ totalDrivers: allDrivers.length, allDrivers });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingDrivers = async (req, res) => {
  try {
    const pendingDrivers = await driverModels.find({ status: "pending" });
    res.status(200).json({ totalDrivers: pendingDrivers.length, pendingDrivers });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
