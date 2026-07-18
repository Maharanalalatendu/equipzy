const express = require("express");

const router = express.Router();

const auth = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/register",auth.register);

router.post("/verify",auth.verifyOTP);

router.post("/login",auth.login);

router.post("/resend-otp",auth.resendOTP);

router.post("/forgot-password", auth.forgotPassword);

router.post("/reset-password", auth.resetPassword);

router.post("/profile", protect, (req, res) => {

    res.json({

        success: true,

        user: req.User,
    });
});

module.exports = router;