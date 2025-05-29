import mongoose, { Schema } from "mongoose";

const driverSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    vehicleType :{
      type: String,
      required: true,
      enum: ["Mehran", "Alto", "Cultus", "Civic", "Corolla XLi", "Corolla GLi"],
    },
    profilePicture: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending"],
      default: "pending",
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleFrontPicture: {
      type: String,
      required: true,
    },
    licenseCertificate: {
      type: String,
      required: true,
    },
    iban: {
      type: String,
      required: true,
      unique: true,
      match: /^PK[0-9]{2}[A-Z]{4}[0-9]{16}$/,
    },
  },
  {
    timestamps: true,
  }
);

export const driverModels = mongoose.model("Driver", driverSchema);