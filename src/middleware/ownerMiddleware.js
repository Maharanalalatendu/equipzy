const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const protectAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token is required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.Owner = await prisma.Owner.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                email: true,
                isVerified: true,
            },
        });

        if (!req.Owner) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

         if (!req.Owner.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Owner is not verified. Please verify your account first.",
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Token",
        });
    }
};

module.exports = protectAdmin;