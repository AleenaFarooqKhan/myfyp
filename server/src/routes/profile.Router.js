import express from 'express';
import { authenticate } from '../middleware/admin.auth.middlewae.js';
import { getUserProfile, updateUserProfile } from '../controller/profile.controller.js';

const router = express.Router();

// GET profile - only authenticated users can access their own profile
router.get('/', authenticate, getUserProfile);

// PUT update profile - only authenticated users can update their profile
router.put('/', authenticate, updateUserProfile);

export default router;
