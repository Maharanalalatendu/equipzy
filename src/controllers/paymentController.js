const prisma = require("../config/prisma");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// Create Razorpay Order

exports.createOrder = async (req, res) => {

    try {

        const { amount, upi_id } = req.body;

        if (!amount) {
            return res.status(400).json({
                message: "Amount is required"
            });
        }

        const order = await razorpay.orders.create({

            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now()

        });

        const payment = await prisma.payment.create({

            data: {

                user_id: req.User.id,

                amount,

                currency: "INR",

                upi_id,

                razorpay_order_id: order.id,

                status: "created"

            }

        });

        res.json({

            success: true,

            payment,

            order

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// Verify Payment

exports.verifyPayment = async (req, res) => {

    try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature,

            payment_method

        } = req.body;

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const generated_signature = crypto

            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)

            .update(body)

            .digest("hex");

        if (generated_signature !== razorpay_signature) {

            return res.status(400).json({

                success: false,

                message: "Payment Verification Failed"

            });

        }

        const payment = await prisma.payment.update({

            where: {

                razorpay_order_id

            },

            data: {

                razorpay_payment_id,

                razorpay_signature,

                payment_method,

                status: "paid"

            }

        });

        res.json({

            success: true,

            message: "Payment Successful",

            payment

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};