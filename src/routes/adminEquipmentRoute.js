const express = require("express");

const router = express.Router();

const adminAuth = require("../middleware/authMiddleware");

const adminEquipmentController = require("../controllers/adminEquipmentController");

router.put("/approve-equipment/:id",adminAuth,adminEquipmentController.approveEquipment);

router.put("/reject-equipment/:id",adminAuth,adminEquipmentController.rejectEquipment);

module.exports = router;