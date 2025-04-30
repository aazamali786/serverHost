const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  photos: [{ type: String }],
  description: {
    type: String,
  },
  perks: [{ type: String }],
  extraInfo: {
    type: String,
  },
  maxGuests: {
    type: Number,
  },
  price: {
    type: Number,
  },
  propertyType: {
    type: String,
    enum: ["pg", "hostel", "party-hall", "banquet-hall", "rooftop"],
    default: "pg",
    required: true,
  },
  isActive: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true,
  },
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
