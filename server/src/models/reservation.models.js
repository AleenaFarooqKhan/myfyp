import mongoose, { Schema } from "mongoose";

const reservationSchema = new Schema({
  carpool: { 
    type: Schema.Types.ObjectId, 
    ref: "Carpool", 
    required: true 
  },
  driver: { 
    type: Schema.Types.ObjectId, 
    ref: "Driver", 
    required: true 
  },
  passenger: { 
    type: Schema.Types.ObjectId, 
    ref: "Passenger" 
  },
  passengerDetails: {
    name: String,
    phone: String,
    pickupLocation: String,
    pickupCoordinates: {
      latitude: Number,
      longitude: Number
    },
    dropoffLocation: String,
    dropoffCoordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  ratePerKm: {
    type: Number,
    required: true,
    default: 20 // Default rate is 20 PKR per km
  },
  distance: {
    type: Number, // Total planned distance in km
    required: true,
    default: 0
  },
  actualDistance: {
    type: Number, // Actual distance traveled (can be less if dropped off early)
    default: 0
  },
  plannedFare: {
    type: Number, // Original fare based on planned distance
    required: true
  },
  finalFare: {
    type: Number, // Final fare based on actual distance traveled
    default: 0
  },
  seatsReserved: { 
    type: Number, 
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
    default: "pending"
  },
  isPartialJourney: {
    type: Boolean,
    default: false
  },
  partialDropoffLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String
  },
  notes: String,
  schedule: {
    pickupTime: Date,
    pickupPoint: String
  }
}, { 
  timestamps: true 
});

export const Reservation = mongoose.model("Reservation", reservationSchema);