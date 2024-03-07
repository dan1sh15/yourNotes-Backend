const nodeMailer = require('nodemailer');
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {

        let transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
        
        // console.log("Transporter: ", transporter);

        let info = await transporter.sendMail({
            from: "yourNotes App",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        // console.log(info);
        return info;

    } catch (error) {
        console.log("Error in mail sender", error.message);
    }
};

module.exports = mailSender;