const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        
        const token = req.body.token || req.header("auth-token");

        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Token not found",
            });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decode;
        } catch (error) {
            console.log(error);
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating token",
        });
    }
}