import express from "express";
import { 
  registerDriver,
  signInDriver,
  logOutDriver,
  findDriverByPhoneNumber
} from "../controller/drivers.controller.js";
import{ upload} from "../middleware/multer.js"; // ✅ Make sure this path is correct

const router = express.Router();

// Use multer middleware for the register route
router.post("/register", upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'vehicleFrontPicture', maxCount: 1 },
  { name: 'licenseCertificatePicture', maxCount: 1 }
]), registerDriver);


router.post("/login", signInDriver);
router.post("/logout", logOutDriver);
router.get("/findByPhoneNumber/:phoneNumber", findDriverByPhoneNumber);

export default router;
