const express = require("express");
const router = express.Router();

const owner = require("../controllers/ownerController");
const protectOwner = require("../middleware/authMiddleware");


router.post("/send-otp", owner.sendOTP);

router.post("/verify-otp", owner.verifyOTP);

router.post("/complete-registration", owner.completeRegistration);

router.post("/login", owner.login);

router.post("/forgot-password", owner.forgotPassword);

router.post("/reset-password", owner.resetPassword);

router.post("/profile", protectOwner, owner.profile);

module.exports = router;