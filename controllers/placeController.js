const Place = require("../models/Place");
const User = require("../models/User");

// Adds a place in the DB
exports.addPlace = async (req, res) => {
  try {
    const userData = req.user;
    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      maxGuests,
      price,
      propertyType,
    } = req.body;
    const place = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      maxGuests,
      price,
      propertyType: propertyType || "pg", // Default to 'pg' if not specified
    });
    res.status(200).json({
      place,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
};

// Returns user specific places
exports.userPlaces = async (req, res) => {
  try {
    const userData = req.user;
    const id = userData.id;
    res.status(200).json(await Place.find({ owner: id }));
  } catch (err) {
    res.status(500).json({
      message: "Internal serever error",
    });
  }
};

// Updates a place
exports.updatePlace = async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const {
      id,
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      maxGuests,
      price,
      propertyType,
    } = req.body;

    const place = await Place.findById(id);
    if (userId === place.owner.toString()) {
      place.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        maxGuests,
        price,
        propertyType: propertyType || place.propertyType, // Keep existing propertyType if not provided
      });
      await place.save();
      res.status(200).json({
        message: "place updated!",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
};

// Returns all the places in DB
exports.getPlaces = async (req, res) => {
  try {
    const places = await Place.find({ isActive: 1 });
    res.status(200).json({
      places,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Returns single place, based on passed place id
exports.singlePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place) {
      return res.status(400).json({
        message: "Place not found",
      });
    }
    res.status(200).json({
      place,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal serever error",
    });
  }
};

// Search Places in the DB
exports.searchPlaces = async (req, res) => {
  try {
    const searchword = req.params.key;

    if (searchword === "") return res.status(200).json(await Place.find());

    const searchMatches = await Place.find({
      address: { $regex: searchword, $options: "i" },
    });

    res.status(200).json(searchMatches);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal serever error 1",
    });
  }
};

// Get available property types
exports.getPropertyTypes = async (req, res) => {
  try {
    const propertyTypes = [
      "pg",
      "hostel",
      "party-hall",
      "banquet-hall",
      "rooftop",
    ];
    res.status(200).json({
      success: true,
      propertyTypes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Delete a place
exports.deletePlace = async (req, res) => {
  try {
    const userData = req.user;
    const { id } = req.params;

    // Find the place and check if the user is the owner
    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    if (place.owner.toString() !== userData.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this place",
      });
    }

    // Delete the place
    await Place.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Place deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting place:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Get pending (inactive) places
exports.getPendingPlaces = async (req, res) => {
  try {
    const places = await Place.find({ isActive: 0 }).populate({
      path: "owner",
      select: "name email",
    });
    res.status(200).json({
      success: true,
      places,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Activate a place
exports.activatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    place.isActive = 1;
    await place.save();

    res.status(200).json({
      success: true,
      message: "Property KYC approved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
