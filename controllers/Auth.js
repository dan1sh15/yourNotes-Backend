const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); 


exports.signup = async (req, res) => {
    try {
        
        const {name, email, password, confirmPassword} = req.body;

        if(!name || !email || !password || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Please fill all the required field properly",
            });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm password didn't matched, please try agin",
            });
        }

        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exist",
            });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const userData = await User.create({
            name,
            email,
            password: hashedPassword,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${name}`
        });
        
        const payload = {
            email: userData.email,
            id: userData._id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h"
        });

        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            data: userData,
            token,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered, please try again",
        });
    }
};

exports.login = async (req, res) => {
    try {
        
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again",
            });
        }

        const user = await User.findOne({email});

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered, please signup first",
            });
        }

        // generate jwt after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h"
            });

            return res.status(200).json({
                success: true,
                message: "Logged in successfully",
                user,
                token,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid Password",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error, please try again",
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { newPassword, password, confirmPassword } = req.body;

        if(!newPassword || !password || !confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "All fields are required",
            });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password didn't matched",
            });
        }

        if(password === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and old password are same"
            });
        }

        const user = await User.findById(userId);

        if(await bcrypt.compare(password, user.password)) {
            // console.log(user.password);
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatedUser = await User.findByIdAndUpdate(userId, {
                $set: {
                    password: hashedPassword,
                }
            }, {new: true});

            if(!updatedUser) {
                return res.status(400).json({
                    success: false,
                    message: "User password can't be updated, please try again",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Password changed successfully",
                user: updatedUser,
            });

        } else {
            return res.status(400).json({
                success: false,
                message: "Password didn't matched",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
        });
    }
}

exports.getUserDetails = async (req, res) => {
    try {
        
        const id = req.user.id;

        const userDetails = await User.findById(id).populate("notes").exec();

        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User details can't be fetched",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: userDetails,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

exports.editUserDetails = async (req, res) => {
    try {
        
        const {name} = req.body;
        const id = req.user.id;

        if(!name) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await User.findByIdAndUpdate(id, {
            $set: {
                name: name
            }
        }, {new: true});

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "Unable to update changes"
            });
        }

        req.user = user;

        return res.status(200).json({
            success: true,
            message: "User Details updated successfully",
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
        });
    }
};