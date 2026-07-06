const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const protectOwner = async (req, res, next) => {
    try {

        const { token } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.owner = {
            id: decoded.id,
        };

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token",
        });

    }
};

module.exports = protectOwner;