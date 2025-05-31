import { Router } from "express";
import { upload } from "../middleware/multer.js";
import {
  approveDriver,
  getAllAdmins,
  logOut,
  registerAdmin,
  rejectDriver,
  signIn,
} from "../controller/admin.controller.js";
import {
  getAllDrivers,
  getPendingDrivers,
  logOutDriver,
  registerDriver,
  signInDriver,
} from "../controller/drivers.controller.js";
import {
  sendOTP,
  verifyOTP,
  resetPassword,
}  from"../controller/Forgotpassword.controller.js";
import {
  allPassengers,
  loginInPassenger,
  logOutPassenger,
  registerPassenger,
} from "../controller/passenger.controller.js";
import pkg from 'jsonwebtoken';
const { verify } = pkg;

const userRouter = Router();
const driverRouter = Router();
const passengerRouter = Router();


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
export { userRouter };
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
driverRouter.route('/send-otp').post( sendOTP);
driverRouter.route('/verify-otp').post( verifyOTP);
driverRouter.route('/reset-password').post( resetPassword);

export { driverRouter };

passengerRouter.route("/register").post(registerPassenger);
passengerRouter.route("/login").post(loginInPassenger);
passengerRouter.route("/logout").post(logOutPassenger);
passengerRouter.route("/all-passengers").get(allPassengers);
export { passengerRouter };


