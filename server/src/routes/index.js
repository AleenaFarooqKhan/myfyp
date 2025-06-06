import { Router } from "express";
import { upload } from "../middleware/multer.js";
import {
  approveDriver,
  getAllAdmins,
  logOut,
  registerAdmin,
  rejectDriver,
  sendMessageToDriver,
  signIn,
} from "../controller/admin.controller.js";
import {
  getAllDrivers,
  getPendingDrivers,
  logOutDriver,
  registerDriver,
  signInDriver,
  getProfile as getDriverProfile,
  updateProfile as updateDriverProfile,
  sendOTP as sendDriverOTP,
  verifyOTP as verifyDriverOTP,
  resetPassword as resetDriverPassword,
  getAllMessages,
} from "../controller/drivers.controller.js";
import {
  allPassengers,
  loginPassenger,
  logOutPassenger,
  registerPassenger,
  getProfile as getPassengerProfile,
  updateProfile as updatePassengerProfile,
  sendOTP as sendPassengerOTP,
  verifyOTP as verifyPassengerOTP,
  resetPassword as resetPassengerPassword,
} from "../controller/passenger.controller.js";


const userRouter = Router();
const driverRouter = Router();
const passengerRouter = Router();

// Admin routes
userRouter
  .route("/register")
  .post(
    upload.fields([{ name: "profilePicture", maxCount: 1 }]),
    registerAdmin
  );
userRouter.route("/login").post(signIn);
userRouter.route("/logout").post(logOut);
userRouter.route("/approve").post(approveDriver);
userRouter.route("/reject").post(rejectDriver);
userRouter.route("/all-admins").get(getAllAdmins);
userRouter.route("/send-message").post(sendMessageToDriver);
export { userRouter };

// Driver routes
driverRouter.route("/register").post(
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "vehicleFrontPicture", maxCount: 1 },
    { name: "licenseCertificatePicture", maxCount: 1 },
  ]),
  registerDriver
);
driverRouter.route("/login").post(signInDriver);
driverRouter.route("/logout").post(logOutDriver);
driverRouter.route("/approved-drivers").get(getAllDrivers);
driverRouter.route("/pending-drivers").get(getPendingDrivers);
driverRouter.route("/send-otp").post(sendDriverOTP);
driverRouter.route("/verify-otp").post(verifyDriverOTP);
driverRouter.route("/reset-password").post(resetDriverPassword);
driverRouter.route("/:userId/profile").get(getDriverProfile);
driverRouter.route("/:userId/update-profile").patch(updateDriverProfile);
driverRouter.route("/:driverId/get-messages").get(getAllMessages);
export { driverRouter };

// Passenger routes
passengerRouter.route("/register").post(registerPassenger);
passengerRouter.route("/login").post(loginPassenger);
passengerRouter.route("/logout").post(logOutPassenger);
passengerRouter.route("/all-passengers").get(allPassengers);
passengerRouter.route("/:userId/profile").get(getPassengerProfile);
passengerRouter.route("/:userId/update-profile").patch(updatePassengerProfile);
passengerRouter.route("/send-otp").post(sendPassengerOTP);
passengerRouter.route("/verify-otp").post(verifyPassengerOTP);
passengerRouter.route("/reset-password").post(resetPassengerPassword);
export { passengerRouter };
