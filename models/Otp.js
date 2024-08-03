const mongoose = require('mongoose');
const mailSender = require("../utils/MailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        requried: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60,
    },
});

async function sendVerificationMail(email, otp) {
    try {
        
        const mailResponse = await mailSender(email, "Verification Email from yourNotes App", 
            `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
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
              <h2 style="color: #5a48c1;">Email Verification OTP</h2>
              <p>Your verification OTP is: </p>
              <div class="instructions" style="width: 50%;
              margin: auto;
              text-align: left;
              font-size: small;
              color: rgb(74, 74, 74);
              text-align: center;">
                <p style="font-size: larger; font-weight: bold;">${otp}</p>
                
                <p>Thank you for choosing <span class="highlightText " style="color: #5a48c1;
                    font-weight: 600;">yourNotes</span>.</p>
              </div>
            </div>
          </div>
        </body>
        </html>`
        );
        console.log("Email sent successfully", mailResponse);

    } catch (error) {
        console.log("Error sending email", error.message);
        throw error;
    }
};

otpSchema.pre("save", async function(next) {
    await sendVerificationMail(this.email, this.otp);
    next();
});

module.exports = mongoose.model("OTP", otpSchema);