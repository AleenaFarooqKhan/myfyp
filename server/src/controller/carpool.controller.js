import { Carpool } from "../models/carpool.models.js";
import { isPointInAbbottabad, calculateDistance } from "../utils/locationUtils.js";

// Create Carpool (Driver creates it)
export const createCarpool = async (req, res) => {
  try {
    const { 
      driverId, 
      driverName, 
      startLocation,
      endLocation,
      viaRoute,
      startCoordinates,
      endCoordinates,
      viaCoordinates,
      seatsAvailable, 
      farePerKm,
      departureTime 
    } = req.body;

    // Validate coordinates are within Abbottabad region
    if (!startCoordinates || !endCoordinates ||
        !isPointInAbbottabad(startCoordinates.latitude, startCoordinates.longitude) ||
        !isPointInAbbottabad(endCoordinates.latitude, endCoordinates.longitude)) {
      return res.status(400).json({
        success: false,
        message: "Both pickup and dropoff locations must be within Abbottabad region"
      });
    }
    
    // Calculate total distance
    const totalDistance = calculateDistance(
      startCoordinates.latitude,
      startCoordinates.longitude,
      endCoordinates.latitude,
      endCoordinates.longitude
    );

    const carpool = await Carpool.create({
      driverId,
      driverName,
      startLocation,
      endLocation,
      viaRoute: viaRoute || "",
      startCoordinates,
      endCoordinates,
      viaCoordinates: viaCoordinates || [],
      seatsAvailable: Number(seatsAvailable),
      farePerKm: Number(farePerKm) || 20, // Default to 20 PKR if not specified
      totalDistance,
      departureTime: departureTime || new Date()
    });

    res.status(201).json({ 
      success: true, 
      message: "Carpool created successfully!", 
      carpool 
    });

  } catch (error) {
    console.error("Create Carpool Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create carpool" 
    });
  }
};

// Get All Available Carpools (Passenger views)
export const getAllCarpools = async (req, res) => {
  try {
    const carpools = await Carpool.find({ seatsAvailable: { $gt: 0 } })
      .populate("driverId", "firstName lastName phoneNumber vehicleModel rating")
      .populate("passengers.passengerId", "name phone")
      .sort({ departureTime: 1 }) // Sort by soonest departure
      .exec();

    res.status(200).json({ 
      success: true, 
      count: carpools.length,
      carpools 
    });

  } catch (error) {
    console.error("Get Carpools Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch available carpools" 
    });
  }
};

// Search for Carpools
export const searchCarpools = async (req, res) => {
  try {
    const { 
      startLat, 
      startLng, 
      endLat, 
      endLng,
      distance,
      radius = 5 // Default search radius (km)
    } = req.query;
    
    // Validate input coordinates
    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        message: "Missing required location coordinates"
      });
    }
    
    // Verify locations are within Abbottabad region
    if (!isPointInAbbottabad(startLat, startLng) || !isPointInAbbottabad(endLat, endLng)) {
      return res.status(400).json({
        success: false,
        message: "Both pickup and dropoff locations must be within Abbottabad region"
      });
    }
    
    // Find carpools with available seats that match the route
    const availableCarpools = await Carpool.find({
      seatsAvailable: { $gt: 0 },
      departureTime: { $gte: new Date() } // Only future carpools
    });
    
    // Filter carpools based on proximity to start and end points
    const matchingCarpools = availableCarpools.filter(carpool => {
      // Check if carpool's start point is near passenger's start point
      const startDistance = calculateDistance(
        startLat, 
        startLng, 
        carpool.startCoordinates.latitude, 
        carpool.startCoordinates.longitude
      );
      
      // Check if carpool's end point is near passenger's end point
      const endDistance = calculateDistance(
        endLat, 
        endLng, 
        carpool.endCoordinates.latitude, 
        carpool.endCoordinates.longitude
      );
      
      // Consider it a match if both points are within the radius
      return startDistance <= radius && endDistance <= radius;
    });
    
    // Add distance and calculated price to each carpool
    const carpoolsWithPrice = matchingCarpools.map(carpool => {
      const calculatedDistance = distance || calculateDistance(startLat, startLng, endLat, endLng);
      const fare = Math.round(calculatedDistance * carpool.farePerKm);
      
      return {
        ...carpool._doc,
        totalDistance: calculatedDistance,
        calculatedPrice: fare
      };
    });
    
    res.status(200).json({
      success: true,
      count: carpoolsWithPrice.length,
      carpools: carpoolsWithPrice
    });
    
  } catch (error) {
    console.error("Search Carpools Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search for carpools"
    });
  }
};

// Passenger joins a carpool
export const joinCarpool = async (req, res) => {
  try {
    const { carpoolId } = req.params;
    const { 
      passengerId, 
      passengerName, 
      pickupLocation,
      pickupCoordinates,
      dropoffLocation,
      dropoffCoordinates,
      distance,
      seatsRequested = 1
    } = req.body;

    // Validate input
    if (!passengerId || !seatsRequested) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
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

    // Check seat availability
    if (carpool.seatsAvailable < seatsRequested) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${carpool.seatsAvailable} seat(s) remaining` 
      });
    }
    
    // Calculate fare based on distance and rate per km
    const calculatedDistance = distance || calculateDistance(
      pickupCoordinates.latitude,
      pickupCoordinates.longitude,
      dropoffCoordinates.latitude,
      dropoffCoordinates.longitude
    );
    const fare = Math.round(calculatedDistance * carpool.farePerKm);

    // Add passenger
    carpool.passengers.push({
      passengerId,
      passengerName,
      pickupLocation,
      pickupCoordinates,
      dropoffLocation,
      dropoffCoordinates,
      distance: calculatedDistance,
      fare,
      seatsBooked: seatsRequested,
      status: "pending"
    });

    // Update available seats
    carpool.seatsAvailable -= seatsRequested;

    await carpool.save();

    res.status(200).json({ 
      success: true, 
      message: "Booking confirmed!",
      fare,
      distance: calculatedDistance,
      remainingSeats: carpool.seatsAvailable,
      carpool 
    });

  } catch (error) {
    console.error("Join Carpool Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to join carpool" 
    });
  }
};

// Complete ride and adjust fare based on actual distance
export const completeRide = async (req, res) => {
  try {
    const { carpoolId, passengerId } = req.params;
    const { 
      actualDropoffLocation, 
      actualDropoffCoordinates, 
      isFullJourney 
    } = req.body;
    
    const carpool = await Carpool.findById(carpoolId);
    if (!carpool) {
      return res.status(404).json({
        success: false,
        message: "Carpool not found"
      });
    }
    
    // Find passenger in the carpool
    const passengerIndex = carpool.passengers.findIndex(
      passenger => passenger.passengerId.toString() === passengerId
    );
    
    if (passengerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found in this carpool"
      });
    }
    
    const passenger = carpool.passengers[passengerIndex];
    
    if (isFullJourney) {
      // Full journey - charge the original fare
      passenger.status = "completed";
      await carpool.save();
      
      return res.status(200).json({
        success: true,
        message: "Ride completed successfully",
        fare: passenger.fare
      });
    }
    
    // Partial journey - recalculate fare based on actual distance traveled
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
      passenger.pickupCoordinates.latitude,
      passenger.pickupCoordinates.longitude,
      actualDropoffCoordinates.latitude,
      actualDropoffCoordinates.longitude
    );
    
    // Calculate new fare based on actual distance
    const actualFare = Math.round(actualDistance * carpool.farePerKm);
    
    // Update passenger with actual journey info
    passenger.actualDistance = actualDistance;
    passenger.actualFare = actualFare;
    passenger.actualDropoffLocation = actualDropoffLocation;
    passenger.actualDropoffCoordinates = actualDropoffCoordinates;
    passenger.isPartialJourney = true;
    passenger.status = "completed";
    
    await carpool.save();
    
    res.status(200).json({
      success: true,
      message: "Partial ride completed successfully",
      plannedDistance: passenger.distance,
      actualDistance,
      plannedFare: passenger.fare,
      actualFare,
      savings: passenger.fare - actualFare
    });
    
  } catch (error) {
    console.error("Complete Ride Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete ride"
    });
  }
};