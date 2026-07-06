const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const transporter = require("../config/mailer");

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, mobile_number } = req.body;

        if (!name || !email || !password || !mobile_number) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if email already exists
        const userExist = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // OTP expiry time (10 minutes)
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                mobile_number,
                password: hashedPassword,
                otp,
                otpExpiry,
                isVerified: false,
            },
        });

        // Send OTP Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Email Verification OTP",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Hello ${name},</h2>

                    <p>Thank you for registering.</p>

                    <p>Your OTP for email verification is:</p>

                    <h1 style="color: blue;">${otp}</h1>

                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>

                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
        });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: "User registered successfully. OTP sent to your email.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Verify OTP

exports.verifyOTP = async(req,res)=>{

const {email,otp}=req.body;

const user = await prisma.user.findUnique({

where:{email}

});

if(!user){

return res.json({

message:"User not found"

});

}

if(user.otp!==otp){

return res.json({

message:"Invalid OTP"

});

}

if(user.otpExpiry<new Date()){

return res.json({

message:"OTP Expired"

});

}

await prisma.user.update({

where:{email},

data:{

isVerified:true,

otp:null,

otpExpiry:null

}

});

const token = generateToken(user.id);

res.json({

message:"Verified",

token

});

};

//regenarate OTP

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP in database
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend OTP Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Your new OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Login

exports.login = async(req,res)=>{

    try {

const {email,password}=req.body;

const user = await prisma.user.findUnique({

where:{email}

});

if(!user){

return res.json({

message:"User not found"

});

}

if(!user.isVerified){

return res.json({

message:"Verify Email First"

});

}

const match = await bcrypt.compare(password,user.password);

if(!match){

return res.json({

message:"Wrong Password"

});

}

const token = generateToken(user.id);

res.json({

token,

user

});
} catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};



//Forgot Password Controller

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP valid for 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
    await prisma.user.update({
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
        <h2>Reset Password</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



//Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check OTP expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear OTP
    await prisma.user.update({
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
      message: "Internal Server Error",
    });
  }
};