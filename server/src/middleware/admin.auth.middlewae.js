import jwt from "jsonwebtoken";
import { adminsModel } from "../models/admins.models.js";
import { driverModels } from "../models/drivers.models.js";
import { passengerModel } from "../models/passengers.models.js";

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user data to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Check for token in cookies, headers or body
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.body && req.body.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication failed. Token not provided." 
      });
    }
    
    // Verify the token with our secret
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    
    if (!decoded.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format" 
      });
    }
    
    // Check in all user types (admin, driver, passenger)
    let user = null;
    
    user = await adminsModel.findById(decoded.id);
    if (!user) {
      user = await driverModels.findById(decoded.id);
    }
    if (!user) {
      user = await passengerModel.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Add user info to request
    req.user = user;
    req.user.userId = decoded.id; // Add userId from token
    
    // Determine user type
    if (user.constructor.modelName === "Admin") {
      req.userType = "admin";
    } else if (user.constructor.modelName === "Driver") {
      req.userType = "driver";
    } else {
      req.userType = "passenger";
    }
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    console.error("Authentication error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error during authentication" 
    });
  }
};

/**
 * Middleware to verify if a user has admin privileges
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    // Authentication should happen before this middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    // Check if user is an admin
    if (req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required for this operation"
      });
    }
    
    // If user is admin, proceed to next middleware/controller
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during admin verification"
    });
  }
};

/**
 * Middleware to verify if a user is a driver
 */
export const verifyDriver = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    if (req.userType !== 'driver') {
      return res.status(403).json({
        success: false,
        message: "Driver privileges required for this operation"
      });
    }
    
    next();
  } catch (error) {
    console.error("Driver verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during driver verification"
    });
  }
};

/**
 * Middleware to verify if a user is a passenger
 */
export const verifyPassenger = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    if (req.userType !== 'passenger') {
      return res.status(403).json({
        success: false,
        message: "Passenger privileges required for this operation"
      });
    }
    
    next();
  } catch (error) {
    console.error("Passenger verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during passenger verification"
    });
  }
};