const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const protectAdmin = require("../middleware/authMiddleware");

router.post("/register", adminController.register);

router.post("/login", adminController.login);

router.post("/profile",protectAdmin, adminController.profile);

module.exports = router;