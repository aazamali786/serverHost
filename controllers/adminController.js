const User = require("../models/User");
const Place = require("../models/Place");
const Booking = require("../models/Booking");

// Get admin dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get total counts from all collections
    const [totalUsers, totalPlaces, totalBookings] = await Promise.all([
      User.countDocuments(),
      Place.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPlaces,
        totalBookings,
      },
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
