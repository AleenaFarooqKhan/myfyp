import { Reservation } from "../models/reservation.models.js";
import { Carpool } from "../models/carpool.models.js";
import { isPointInAbbottabad, calculateDistance } from "../utils/locationUtils.js";

export const createReservation = async (req, res) => {
  try {
    const { userId } = req.user; 
    const {
      carpoolId,
      passengerId,
      passengerName,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates,
      distance,
      fare,
      ratePerKm,
      seats = 1,
      notes
    } = req.body;

    if (!seats) {
      return res.status(400).json({
        success: false,
        message: "Number of seats is required"
      });
    }
    
    // Validate coordinates are within Abbottabad region
    if (!pickupCoordinates || !dropoffCoordinates ||
        !isPointInAbbottabad(pickupCoordinates.latitude, pickupCoordinates.longitude) ||
        !isPointInAbbottabad(dropoffCoordinates.latitude, dropoffCoordinates.longitude)) {
      return res.status(400).json({
        success: false,
        message: "Both pickup and dropoff locations must be within Abbottabad region"
      });
    }

    const carpool = await Carpool.findById(carpoolId);

    if (!carpool) {
      return res.status(404).json({
        success: false,
        message: "Carpool not found"
      });
    }

    if (carpool.seatsAvailable < seats) {
      return res.status(400).json({
        success: false,
        message: `Only ${carpool.seatsAvailable} seats available`
      });
    }
    
    // Calculate distance and fare if not provided
    const calculatedDistance = distance || calculateDistance(
      pickupCoordinates.latitude,
      pickupCoordinates.longitude,
      dropoffCoordinates.latitude,
      dropoffCoordinates.longitude
    );
    
    const calculatedFare = fare || Math.round(calculatedDistance * (ratePerKm || carpool.farePerKm));

    const reservation = await Reservation.create({
      carpool: carpoolId,
      driver: carpool.driverId,
      passenger: passengerId || userId,
      passengerDetails: {
        name: passengerName,
        pickupLocation,
        pickupCoordinates,
        dropoffLocation,
        dropoffCoordinates
      },
      ratePerKm: ratePerKm || carpool.farePerKm,
      distance: calculatedDistance,
      plannedFare: calculatedFare,
      seatsReserved: seats,
      schedule: {
        pickupTime: carpool.departureTime,
        pickupPoint: pickupLocation
      },
      notes,
      status: "confirmed"
    });

    // Update carpool with passenger info
    carpool.passengers.push({
      passengerId: passengerId || userId,
      passengerName,
      pickupLocation,
      pickupCoordinates,
      dropoffLocation,
      dropoffCoordinates,
      distance: calculatedDistance,
      fare: calculatedFare,
      seatsBooked: seats,
      status: "confirmed"
    });
    
    carpool.seatsAvailable -= seats;
    await carpool.save();

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation,
      fare: calculatedFare,
      distance: calculatedDistance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const completeReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { 
      actualDropoffLocation, 
      actualDropoffCoordinates, 
      isFullJourney 
    } = req.body;
    
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }
    
    if (isFullJourney) {
      // Full journey - use original fare
      reservation.status = "completed";
      reservation.actualDistance = reservation.distance;
      reservation.finalFare = reservation.plannedFare;
      
      await reservation.save();
      
      return res.status(200).json({
        success: true,
        message: "Full journey completed",
        fare: reservation.plannedFare
      });
    }
    
    // Validate partial journey dropoff location
    if (!actualDropoffCoordinates || !isPointInAbbottabad(
      actualDropoffCoordinates.latitude, 
      actualDropoffCoordinates.longitude
    )) {
      return res.status(400).json({
        success: false,
        message: "Invalid dropoff location"
      });
    }
    
    // Calculate actual distance traveled
    const actualDistance = calculateDistance(
      reservation.passengerDetails.pickupCoordinates.latitude,
      reservation.passengerDetails.pickupCoordinates.longitude,
      actualDropoffCoordinates.latitude,
      actualDropoffCoordinates.longitude
    );
    
    // Calculate adjusted fare
    const adjustedFare = Math.round(actualDistance * reservation.ratePerKm);
    
    // Update reservation
    reservation.status = "completed";
    reservation.isPartialJourney = true;
    reservation.actualDistance = actualDistance;
    reservation.finalFare = adjustedFare;
    reservation.partialDropoffLocation = {
      coordinates: actualDropoffCoordinates,
      address: actualDropoffLocation
    };
    
    await reservation.save();
    
    res.status(200).json({
      success: true,
      message: "Partial journey completed",
      plannedDistance: reservation.distance,
      actualDistance,
      plannedFare: reservation.plannedFare,
      finalFare: adjustedFare,
      savings: reservation.plannedFare - adjustedFare
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Other functions remain the same as in your original code
export const getPassengerReservations = async (req, res) => {
  try {
    const { passengerId } = req.params;
    
    const reservations = await Reservation.find({ passenger: passengerId })
      .populate('carpool')
      .populate('driver', 'name phone');

    res.status(200).json({
      success: true,
      reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;
    const { userId } = req.user;

    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    // Check if user is driver of this carpool
    const carpool = await Carpool.findById(reservation.carpool);
    if (carpool.driver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this reservation"
      });
    }

    reservation.status = status;
    await reservation.save();

    res.status(200).json({
      success: true,
      reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { userId } = req.user;

    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    // Check if user is authorized (either passenger or driver)
    const carpool = await Carpool.findById(reservation.carpool);
    if (reservation.passenger.toString() !== userId.toString() && 
        carpool.driver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this reservation"
      });
    }

    // Update carpool seats
    if (carpool) {
      carpool.seatsAvailable += reservation.seatsReserved;
      await carpool.save();
    }

    // Either delete or mark as cancelled
    await Reservation.findByIdAndUpdate(reservationId, { status: "cancelled" });

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add this new function to your reservation.controller.js file

export const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const reservations = await Reservation.find({ passenger: userId })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .populate({
        path: 'carpool',
        select: 'departureTime farePerKm driverId seatsAvailable'
      })
      .populate({
        path: 'driver',
        select: 'name phone'
      });

    // Format the response data for easier frontend consumption
    const formattedReservations = reservations.map(res => ({
      _id: res._id,
      pickupLocation: res.passengerDetails.pickupLocation,
      dropoffLocation: res.passengerDetails.dropoffLocation,
      distance: res.distance,
      fare: res.plannedFare,
      status: res.status,
      ratePerKm: res.ratePerKm,
      createdAt: res.createdAt,
      departureTime: res.carpool?.departureTime,
      driverName: res.driver?.name || "Driver",
      driverPhone: res.driver?.phone
    }));

    res.status(200).json({
      success: true,
      reservations: formattedReservations
    });
  } catch (error) {
    console.error("Error getting user reservations:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};