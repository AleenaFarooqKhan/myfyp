import { driverModels } from '../models/drivers.models.js';
import bcrypt from 'bcryptjs';
import { otpEmail } from '../services/mailer.js'; // ✅ Correct path to mailer.js

const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await driverModels.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = generateOTP();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStore.set(email, { otp, expires });

  try {
    await otpEmail(email, user.username || 'User', otp); // ✅ Use mailer service
    console.log(`OTP for ${email} is ${otp}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: 'OTP not requested' });
  if (record.expires < new Date()) return res.status(400).json({ message: 'OTP expired' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  otpStore.delete(email);
  res.status(200).json({ message: 'OTP verified' });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await driverModels.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
};

export { sendOTP, verifyOTP, resetPassword };
