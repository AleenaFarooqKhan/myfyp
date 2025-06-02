import mongoose from "mongoose"

const passengerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true
    },   
    otp:{
      type: String,
      default: null,
    },
   
}, {
    timestamps: true
});

export const passengerModel = mongoose.model('Passenger', passengerSchema);

