import express from "express";
import { 
  createCarpool, 
  getAllCarpools, 
  joinCarpool, 
  searchCarpools,
  completeRide 
} from "../controller/carpool.controller.js";
import { authenticate } from "../middleware/admin.auth.middlewae.js";

const router = express.Router();

// Create a new carpool (Driver creates it)
router.post("/create", authenticate, createCarpool);

// Get all available carpools
router.get("/available", getAllCarpools);

// Search for carpools
router.get("/search", searchCarpools);

// Passenger joins a carpool
router.post("/join/:carpoolId", authenticate, joinCarpool);

// Complete a ride with partial journey handling
router.post("/:carpoolId/complete/:passengerId", authenticate, completeRide);

export default router;