const express = require("express");
const router = express.Router();
const ratelimit = require("express-rate-limit");
const {register , login, logout , googleAuth , getMe, refreshToken} = require('../controllers/authController');
const { protect } = require("../middleware/authMiddleware");

const authLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, try again later" },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleAuth);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;