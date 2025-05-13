const express = require("express");
const router = express.Router();
const multer = require("multer");
const { isLoggedIn } = require("../middlewares/user");

const upload = multer({ dest: "/tmp" });

const {
  register,
  login,
  logout,
  googleLogin,
  uploadPicture,
  updateUserDetails,
  getAllOwners,
  verifyOwner,
  unverifyOwner,
} = require("../controllers/userController");

// Public routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/google/login").post(googleLogin);
router
  .route("/upload-picture")
  .post(upload.single("picture", 1), uploadPicture);
router.route("/update-user").put(updateUserDetails);
router.route("/logout").get(logout);

// Super Admin routes
router.route("/owners").get(isLoggedIn, getAllOwners);
router.route("/verify-owner/:id").put(isLoggedIn, verifyOwner);
router.route("/unverify-owner/:id").put(isLoggedIn, unverifyOwner);

module.exports = router;
