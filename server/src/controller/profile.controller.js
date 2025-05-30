// Example controller functions
export const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware
    const user = req.user;

    // Return user profile (exclude sensitive info if needed)
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        // Add other profile fields as needed
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body; // sanitize this before update in production

    // Assuming you have a User model that works for all user types
    // Or find the user based on req.userType

    // Here’s an example for a generic user model:
    // const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    // If you have multiple user models, find the correct one:
    let updatedUser = null;
    if (req.userType === 'admin') {
      updatedUser = await adminsModel.findByIdAndUpdate(userId, updateData, { new: true });
    } else if (req.userType === 'driver') {
      updatedUser = await driverModels.findByIdAndUpdate(userId, updateData, { new: true });
    } else if (req.userType === 'passenger') {
      updatedUser = await passengerModel.findByIdAndUpdate(userId, updateData, { new: true });
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};
