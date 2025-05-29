import mongoose, { Schema } from "mongoose";

const carpoolSchema = new Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true
    },
    driverName: {
      type: String,
      required: true
    },
    startLocation: {
      type: String,
      required: true
    },
    startCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    endLocation: {
      type: String,
      required: true
    },
    endCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    viaRoute: {
      type: String,
      default: ""
    },
    viaCoordinates: [{
      latitude: { type: Number },
      longitude: { type: Number }
    }],
    seatsAvailable: {
      type: Number,
      required: true,
      min: 1
    },
    farePerKm: {
      type: Number,
      required: true,
      min: 0,
      default: 20 // Default rate is 20 PKR per km
    },
    totalDistance: {
      type: Number,
      default: 0
    },
    departureTime: {
      type: Date,
      default: Date.now
    },
    passengers: [
      {
        passengerId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Passenger" 
        },
        passengerName: { 
          type: String 
        },
        pickupLocation: { 
          type: String 
        },
        pickupCoordinates: {
          latitude: { type: Number },
          longitude: { type: Number }
        },
        dropoffLocation: { 
          type: String 
        },
        dropoffCoordinates: {
          latitude: { type: Number },
          longitude: { type: Number }
        },
        distance: {
          type: Number, // Distance in km for this passenger
          default: 0
        },
        fare: {
          type: Number, // Calculated fare for this passenger
          default: 0
        },
        seatsBooked: { 
          type: Number, 
          default: 1,
          min: 1 
        },
        status: {
          type: String,
          enum: ["pending", "confirmed", "completed", "cancelled"],
          default: "pending"
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Carpool = mongoose.model("Carpool", carpoolSchema);