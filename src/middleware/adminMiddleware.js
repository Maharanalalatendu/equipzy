const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const protectAdmin = async (req, res, next) => {

    try {

        const { token } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is required",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT_SECRET is not configured",
            });
        }

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