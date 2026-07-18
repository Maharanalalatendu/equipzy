const express = require("express");

const cors = require("cors");

require("dotenv").config();

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
    throw new Error(
        `Missing required environment variables: ${missingEnv.join(", ")}`
    );
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));//middle ware using for req.body

app.use(cors());

app.use(express.json());




const authRoutes = require("./routes/authRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const imageRoutes = require("./routes/imageRoutes");
const equipmentRoute = require("./routes/equipmentRoute");
const adminEquipmentRoute = require("./routes/adminEquipmentRoute");
const paymentRoutes = require("./routes/paymentRoutes");





app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/equipment", equipmentRoute);
app.use("/api/admin/equipment", adminEquipmentRoute);
app.use("/api/payment", paymentRoutes);

module.exports = app;