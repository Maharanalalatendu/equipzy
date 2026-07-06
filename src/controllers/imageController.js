const cloudinary = require("../config/cloudinary");
const prisma = require("../config/prisma");
const streamifier = require("streamifier");

exports.uploadImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });

        }

        const streamUpload = () => {

            return new Promise((resolve, reject) => {

                const stream = cloudinary.uploader.upload_stream(

                    {
                        folder: "NodeImages"
                    },

                    (error, result) => {

                        if (result) resolve(result);

                        else reject(error);

                    }

                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);

            });

        };

        const result = await streamUpload();

        const image = await prisma.image.create({

            data: {

                imageUrl: result.secure_url,

                publicId: result.public_id

            }

        });

        res.status(200).json({

            success: true,

            message: "Image Uploaded",

            data: image

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};