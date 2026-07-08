const prisma = require("../config/prisma");

exports.addEquipment = async (req, res) => {

    try {

        const {
            machine_category,
            guid_line,
            price,
            service_city,
            state,
            district,
            image_url
        } = req.body;

        if (
            !machine_category ||
            !guid_line ||
            !price ||
            !service_city ||
            !state ||
            !district ||
            !image_url
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const equipment = await prisma.equipment.create({

            data: {

                owner_id: req.owner.id,

                machine_category,
                guid_line,
                price,
                service_city,
                state,
                district,
                image_url

            }

        });

        return res.status(201).json({

            success: true,
            message: "Equipment Added Successfully",
            data: equipment

        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};




// Soft Delete Equipment

exports.deleteEquipment = async (req, res) => {

    try {

        const { id } = req.params;

        // Check Equipment

        const equipment = await prisma.equipment.findFirst({

            where: {
                id: id,
                owner_id: req.owner.id,
                delete: 0
            }

        });

        if (!equipment) {

            return res.status(404).json({

                success: false,
                message: "Equipment not found"

            });

        }

        // Soft Delete

        await prisma.equipment.update({

            where: {
                id: id
            },

            data: {
                delete: 1
            }

        });

        return res.status(200).json({

            success: true,
            message: "Equipment deleted successfully"

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};