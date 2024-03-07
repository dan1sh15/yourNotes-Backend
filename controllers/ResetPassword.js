const User = require('../models/User');
const mailSender = require('../utils/MailSender');
const bcrypt = require('bcrypt');
const crypto = require("crypto");

// reset password token generation
exports.resetPasswordToken = async (req, res) => {
    try {
        
        const email = req.body.email;

        const user = await User.findOne({email: email});

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist",
            });
        }

        const token = crypto.randomUUID();

        const updateDetails = await User.findOneAndUpdate(
            {email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            {new: true},
        );

        if(!updateDetails) {
            return res.status(400).json({
                success: false,
                message: "Error updating User",
            });
        }

        const url = process.env.BASE_URL + `/update-password/${token}`;

        // send mail to user
        const mailResponse = await mailSender(email, "Reset Password Link",
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Verification</title>
          <style>
          </style>
        </head>
        <body style="font-family: 'Poppins', sans-serif;
        font-weight: 500;
        font-style: normal;
        margin: 0;    
        padding: 5vh 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #e6e3ff;
        ">
          <div class="container " style="max-width: 600px;
          width: 80%;
          height: 90%;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 1rem;">
            <div class="logo " style="text-align: center;
            margin-bottom: 20px;
            width: 90%; margin: auto; 
            height: 10vh;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 0.5rem;
            background: linear-gradient(#8e82ee, #5a48c1);"
               >
              <h1 style="color: white; text-align: center; margin: auto;">yourNotes App</h1>
            </div>
            <div class="content" style="text-align: center;">
              <h2 style="color: #5a48c1;">Password Reset Verification</h2>
              <p>Please follow the instructions below to reset your password:</p>
              <div class="instructions" style="width: 50%;
              margin: auto;
              text-align: left;
              font-size: small;
              color: rgb(74, 74, 74);
              text-align: center;">
                <p>Click on the following link to verify your request:</p>
                <p style="display: flex; justify-content: center; align-items: center;"><a href='${url}' class="button" style="display: inline-block;
                    padding: 10px 20px;
                    background: linear-gradient(#8e82ee, #5a48c1);
                    color: #fff;
                    text-decoration: none;
                    margin: auto;
                    border-radius: 5px;
                    transition: scale ease-in-out; 
                    transition-duration: 0.3s;">Verify Your Request</a></p>
                
                <p>Thank you for choosing <span class="highlightText " style="color: #5a48c1;
                    font-weight: 600;">yourNotes</span>.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
        
        
        
        
        
        `);

        if(!mailResponse) {
            return res.status(400).json({
                success: false,
                message: "Error sending email from mail sender",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email sent successfully, please check mail and reset your password",
            user: updateDetails,
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Error while sending mail for resetting password, please try again",
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        
        const {password, confirmPassword, token} = req.body;
        
        if(!password || !confirmPassword || !token) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // validation
        if(password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "Password and Confirm Password didn't match",
            });
        }

        const userDetails = await User.findOne({token: token});

        if(!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            });
        }

        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "Token is expired, please regenerate your password token",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true},
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully, please login",
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Error while resetting password, please try again",
        });
    }
};