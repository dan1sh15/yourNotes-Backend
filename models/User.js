const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notes",
        }
    ],
    resetPasswordExpires: {
        type: Date,
    },
    token: {
        type: String,
    }
});

module.exports = mongoose.model("User", userSchema);