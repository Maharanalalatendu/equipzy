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

        req.admin = await prisma.admin.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                user_name: true,
                role: true,
            },
        });

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
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