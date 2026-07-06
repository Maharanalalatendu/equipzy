const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const transporter = require("../config/mailer");

//send otp to owner email for verification

exports.sendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const ownerExist = await prisma.owner.findUnique({
            where: { email },
        });

        if (ownerExist) {

            if (ownerExist.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered",
                });
            }

            // Update OTP for existing unverified owner
            await prisma.owner.update({
                where: { email },
                data: {
                    otp,
                    otpExpiry,
                },
            });

        } else {

            // Create owner with only email and OTP
            await prisma.owner.create({
                data: {
                    email,
                    otp,
                    otpExpiry,
                    isVerified: false,
                },
            });

        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Owner Email Verification",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Email Verification</h2>
                    <p>Your OTP is:</p>
                    <h1 style="color: blue;">${otp}</h1>
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                </div>
            `,
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
// Verify OTP

exports.verifyOTP = async (req, res) => {

    try {

        const { email, otp } = req.body;

        const owner = await prisma.owner.findUnique({
            where: { email },
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found",
            });
        }

        if (!owner.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            });
        }

        if (owner.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (owner.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired",
            });
        }

        await prisma.owner.update({
            where: { email },
            data: {
                isVerified: true,
                otp: null,
                otpExpiry: null,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// Complete Registration

exports.completeRegistration = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            mobile_number,
            address,
            aadhaar_number,
            bank_details,
        } = req.body;

        const owner = await prisma.owner.findUnique({
            where: { email },
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found",
            });
        }

        if (!owner.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedOwner = await prisma.owner.update({
            where: { email },
            data: {
                name,
                password: hashedPassword,
                mobile_number,
                address,
                aadhaar_number,
                bank_details,
            },
        });

        const token = generateToken(updatedOwner.id);

        res.status(200).json({
            success: true,
            message: "Registration completed successfully",
            token,
            owner: updatedOwner,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};


// Login

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const owner = await prisma.owner.findUnique({
            where: { email },
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found",
            });
        }

        if (!owner.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        if (!owner.password) {
            return res.status(400).json({
                success: false,
                message: "Please complete your registration first",
            });
        }

        const match = await bcrypt.compare(password, owner.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken(owner.id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            owner: {
                id: owner.id,
                name: owner.name,
                email: owner.email,
                mobile_number: owner.mobile_number,
                address: owner.address,
                aadhaar_number: owner.aadhaar_number,
                bank_details: owner.bank_details,
            },
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// Forgot Password

exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const owner = await prisma.owner.findUnique({
            where: { email },
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found",
            });
        }

        if (!owner.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        if (!owner.password) {
            return res.status(400).json({
                success: false,
                message: "Registration is not completed",
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // OTP expires in 10 minutes
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP
        await prisma.owner.update({
            where: { email },
            data: {
                otp,
                otpExpiry,
            },
        });

        // Send Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Forgot Password OTP",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Reset Password</h2>
                    <p>Your OTP is:</p>
                    <h1 style="color: blue;">${otp}</h1>
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                </div>
            `,
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};


// Reset Password

exports.resetPassword = async (req, res) => {

    try {

        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and password are required",
            });
        }

        const owner = await prisma.owner.findUnique({
            where: { email },
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found",
            });
        }

        if (!owner.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        if (!owner.otp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new OTP.",
            });
        }

        if (owner.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (owner.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.owner.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
//profile

exports.profile = async(req,res)=>{

const owner = await prisma.owner.findUnique({

where:{
id:req.owner.id
},

select:{
id:true,
name:true,
email:true,
mobile_number:true,
address:true,
aadhaar_number:true,
bank_details:true
}

});

res.json(owner);

}