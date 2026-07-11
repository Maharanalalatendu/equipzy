const express = require("express");

const router = express.Router();

const ownerauth = require("../middleware/authMiddleware");

const equipmentController = require("../controllers/equipmentController");

router.post("/add-equipment",ownerauth,equipmentController.addEquipment);
router.delete("/delete-equipment/:id",ownerauth,equipmentController.deleteEquipment);

module.exports = router;