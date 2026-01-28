const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


async function registerUser(req,res){
 
    const {fullName:{firstName, lastName}, email,password} = req.body;

    const isUserAlreadyExists = await UserModel.findOne({email})

    if(isUserAlreadyExists){
        res.status(400).json({message: "User already exists"});
    }


    const hashedpassword = await bcrypt.hash(password,10);

    const user = await UserModel.create({
        fullName: {
            firstName, lastName
        }
        ,email,
        password: hashedpassword
    })

    const token = jwt.sign({_id: user.id}, process.env.JWT_SECRET)

    res.cookies("token", token)

    res.status(201).json({message: "User registered successfully", 
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email
        }
    })

}


module.exports = {
    registerUser
}