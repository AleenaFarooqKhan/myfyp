import { passengerModel } from "../models/passengers.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const registerPassenger = async (req, res) => {
  try {
    const { username, phoneNumber, password } = req.body;
    console.log("data recieve")
    if (!username || !phoneNumber || !password) {
      return res.status(407).json({ message: "Not all details are provided" });
    }
    const exsitingPassenger = await passengerModel.findOne({
      phoneNumber
    });

    if (exsitingPassenger) {
      return res
        .status(400)
        .json({ message: " Phone number already taken" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newPassenger = await passengerModel.create({
      username,
      phoneNumber,
      password: hashedPassword,
    });
    res.status(201).json({ message: "Passenger created", newPassenger });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const loginInPassenger = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(407).json({ message: "Not all details are provided" });
    }
    const passenger = await passengerModel.findOne({ phoneNumber });
    if (!passenger) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const isPasswordValid = await bcryptjs.compare(
      password,
      passenger.password
    );
    if (!isPasswordValid) {
      return res.status(407).json({ message: "Invalid Password" });
    }
    const token = jwt.sign(
      { id: passenger._id },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: "5d" }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("token", token, options)
      .json({ message: "Passenger logged in", passenger });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logOutPassenger = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .clearCookie("token", options)
      .json({ message: "Passenger logged out" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const allPassengers = async (req, res) => {
  try {
    const passengers = await passengerModel.find();
    res.status(200).json({ totalPassengers: passengers.length, passengers });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
