const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


async function registerUser(req,res){
 
    try {
        const {fullName:{firstName, lastName}, email,password} = req.body;

        const isUserAlreadyExists = await UserModel.findOne({email})

        if(isUserAlreadyExists){
            return res.status(400).json({message: "User already exists"});
        }


        const hashedpassword = await bcrypt.hash(password,10);

        const user = await UserModel.create({
            fullName: {
                firstName, lastName
            }
            ,email,
            password: hashedpassword
        })

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)

        res.cookie("token", token)

        res.status(201).json({message: "User registered successfully", 
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({message: "Error registering user", error: error.message});
    }

}

async function loginUser(req,res){

    const {email, password } = req.body;

    const user = await UserModel.findOne({
        email
    })

    if(!user){
        return res.status(400).json({message: "invalid email or password"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({message: "invalid email or password"});
    }

    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(200).json({message: "User logged in successfully",
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email
        }
    })
}



module.exports = {
    registerUser,
    loginUser
}