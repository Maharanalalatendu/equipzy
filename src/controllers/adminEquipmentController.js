const prisma = require("../config/prisma");

// Approve Equipment (status = 1)

exports.approveEquipment = async (req, res) => {

    try {

        const { id } = req.params;

        const equipment = await prisma.equipment.findUnique({
            where: {
                id: id
            }
        });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        await prisma.equipment.update({

            where: {
                id: id
            },

            data: {
                status: 1
            }

        });

        return res.status(200).json({

            success: true,
            message: "Equipment Approved Successfully"

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};


// Reject Equipment (status = 0)

exports.rejectEquipment = async (req, res) => {

    try {

        const { id } = req.params;

        const equipment = await prisma.equipment.findUnique({
            where: {
                id: id
            }
        });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        await prisma.equipment.update({

            where: {
                id: id
            },

            data: {
                status: 0
            }

        });

        return res.status(200).json({

            success: true,
            message: "Equipment Rejected Successfully"

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};