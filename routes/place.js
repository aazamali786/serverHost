const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/user");

const {
  addPlace,
  getPlaces,
  updatePlace,
  singlePlace,
  userPlaces,
  searchPlaces,
  deletePlace,
  getPropertyTypes,
  getPendingPlaces,
  activatePlace,
} = require("../controllers/placeController");

router.route("/").get(getPlaces);
router.route("/pending").get(getPendingPlaces);
router.route("/activate/:id").put(activatePlace);
router.route("/property-types").get(getPropertyTypes);

// Protected routes (user must be logged in)
router.route("/add-places").post(isLoggedIn, addPlace);
router.route("/user-places").get(isLoggedIn, userPlaces);
router.route("/update-place").put(isLoggedIn, updatePlace);

// Not Protected routed but sequence should not be interfered with above routes
router.route("/:id").get(singlePlace).delete(isLoggedIn, deletePlace);
router.route("/search/:key").get(searchPlaces);

module.exports = router;
