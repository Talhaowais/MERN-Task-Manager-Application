const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* ================= GET CURRENT USER ================= */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email avatar");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET ALL USERS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;