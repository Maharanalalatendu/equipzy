const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const transporter = require("../config/mailer");


// Register Admin
exports.register = async (req, res) => {

    try {

        const { user_name, password } = req.body;

        if (!user_name || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        const adminExist = await prisma.admin.findUnique({
            where: {
                user_name,
            },
        });

        if (adminExist) {
            return res.status(400).json({
                success: false,
                message: "Username already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                user_name,
                password: hashedPassword,
            },
        });

        const token = generateToken(admin.id);

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            token,
            admin: {
                id: admin.id,
                user_name: admin.user_name,
                role: admin.role,
            },
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};


// Login Admin
exports.login = async (req, res) => {
    try {

        const { user_name, password } = req.body;

        if (!user_name || !password) {
            return res.status(400).json({
                success: false,
                message: "user_name and password are required",
            });
        }

        const admin = await prisma.admin.findUnique({
            where: {
                user_name: user_name,
            },
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = generateToken(admin.id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                user_name: admin.user_name,
                role: admin.role,
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

//profile

exports.profile = async(req,res)=>{

const admin = await prisma.admin.findUnique({

where:{
id:req.admin.id
},

select:{
id:true,
user_name:true,
role:true
}

});

res.json(admin);

}