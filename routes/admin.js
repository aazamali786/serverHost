const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/adminController");

// Public route to get admin dashboard statistics
router.get("/stats", getStats);

module.exports = router;
