const User = require("../models/User");
const cookieToken = require("../utils/cookieToken");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

// Register/SignUp user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Validate role if provided
    if (role && !["user", "owner", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role provided",
      });
    }

    // Check for required fields for property owners
    if (role === "owner") {
      if (!phone || !address) {
        return res.status(400).json({
          message: "Phone number and address are required for property owners",
        });
      }
    }

    // check if user is already registered
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already registered!",
      });
    }

    user = await User.create({
      name,
      email,
      password,
      role: role || "user", // Default to "user" if role not provided
      phone: role === "owner" ? phone : undefined,
      address: role === "owner" ? address : undefined,
    });

    // after creating new user in DB send the token
    cookieToken(user, res);
  } catch (err) {
    res.status(500).json({
      message: "Internal server Error",
      error: err,
    });
  }
};

// Login/SignIn user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check for presence of email and password
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required!",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist!",
      });
    }

    // match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Email or password is incorrect!",
      });
    }

    // if everything is fine we will send the token
    cookieToken(user, res);
  } catch (err) {
    res.status(500).json({
      message: "Internal server Error",
      error: err,
    });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { name, email, role, phone, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    // Check for required fields for property owners
    if (role === "owner") {
      if (!phone || !address) {
        return res.status(400).json({
          message: "Phone number and address are required for property owners",
        });
      }
    }

    // check if user already registered
    let user = await User.findOne({ email });

    // If the user does not exist, create a new user in the DB
    if (!user) {
      user = await User.create({
        name,
        email,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        role: role || "user",
        phone: role === "owner" ? phone : undefined,
        address: role === "owner" ? address : undefined,
      });
    }

    // send the token
    cookieToken(user, res);
  } catch (err) {
    res.status(500).json({
      message: "Internal server Error",
      error: err,
    });
  }
};

// Upload picture
exports.uploadPicture = async (req, res) => {
  const { path } = req.file;
  try {
    let result = await cloudinary.uploader.upload(path, {
      folder: "Airbnb/Users",
    });
    res.status(200).json(result.secure_url);
  } catch (error) {
    res.status(500).json({
      error,
      message: "Internal server error",
    });
  }
};

// update user
exports.updateUserDetails = async (req, res) => {
  try {
    const { name, password, email, picture, phone, address } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update basic info
    user.name = name;

    // Update phone and address for property owners
    if (user.role === "owner") {
      if (phone) user.phone = phone;
      if (address) user.address = address;
    }

    // Update password and/or picture
    if (picture && !password) {
      user.picture = picture;
    } else if (password && !picture) {
      user.password = password;
    } else if (picture && password) {
      user.picture = picture;
      user.password = password;
    }

    const updatedUser = await user.save();
    cookieToken(updatedUser, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true, // Only send over HTTPS
    sameSite: "none", // Allow cross-origin requests
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

// Get all property owners
exports.getAllOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: "owner" }).select("-password");
    res.status(200).json({
      success: true,
      owners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching property owners",
      error: error.message,
    });
  }
};

// Verify property owner
exports.verifyOwner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required",
      });
    }

    const owner = await User.findById(id);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Property owner not found",
      });
    }

    if (owner.role !== "owner") {
      return res.status(400).json({
        success: false,
        message: "User is not a property owner",
      });
    }

    try {
      // Update verification status
      owner.isVerified = true;

      // Save the owner
      await owner.save();

      res.status(200).json({
        success: true,
        message: "Property owner verified successfully",
        owner,
      });
    } catch (saveError) {
      console.error("Error saving owner verification:", saveError);
      return res.status(500).json({
        success: false,
        message: "Error saving owner verification",
        error: saveError.message,
      });
    }
  } catch (error) {
    console.error("Error verifying owner:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying property owner",
      error: error.message,
    });
  }
};

// Unverify property owner
exports.unverifyOwner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required",
      });
    }

    const owner = await User.findById(id);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Property owner not found",
      });
    }

    if (owner.role !== "owner") {
      return res.status(400).json({
        success: false,
        message: "User is not a property owner",
      });
    }

    owner.isVerified = false;
    await owner.save();

    res.status(200).json({
      success: true,
      message: "Property owner unverified successfully",
      owner,
    });
  } catch (error) {
    console.error("Error unverifying owner:", error);
    res.status(500).json({
      success: false,
      message: "Error unverifying property owner",
      error: error.message,
    });
  }
};
