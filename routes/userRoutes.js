const express = require("express");
const { signup, login, getUserDetails, changePassword, editUserDetails, sendOtp } = require("../controllers/Auth");
const { auth } = require("../middlewares/Auth");   
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post('/send-otp', sendOtp);
router.get("/getUserDetails", auth, getUserDetails);
router.post("/changePassword", auth, changePassword);
router.post("/editUser", auth, editUserDetails);
router.post('/reset-password-token', resetPasswordToken);
router.post('/update-password/:id', resetPassword);

module.exports = router;