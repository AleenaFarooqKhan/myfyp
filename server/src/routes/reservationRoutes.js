import express from "express";
import { 
  createReservation,
  getPassengerReservations,
  updateReservationStatus,
  cancelReservation,
  completeReservation,
  getUserReservations
} from "../controller/reservation.controller.js";
import { authenticate } from "../middleware/admin.auth.middlewae.js";

const router = express.Router();

// Create reservation
router.post("/create", authenticate, createReservation);

// Get passenger's reservations
router.get("/passenger/:passengerId", authenticate, getPassengerReservations);

// Update reservation status
router.patch("/:reservationId/status", authenticate, updateReservationStatus);

// Complete reservation with partial journey support
router.post("/:reservationId/complete", authenticate, completeReservation);

// Cancel reservation
router.delete("/:reservationId", authenticate, cancelReservation);

router.get("/my-reservations", authenticate, getUserReservations);

export default router;