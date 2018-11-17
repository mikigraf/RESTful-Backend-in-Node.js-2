const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
const validate = require('mongoose-validator');

/** 
 * Load environmental variables from .env file, where API keys and passwords are configured
 */
dotenv.load({
    path: '.env'
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        index: true
    },

    password: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['parent', 'provider', 'admin'],
        required: true,
        unique: false,
        default: 'admin'
    },


});

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified("password")) {
            next();
        }
        let hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        return next();
    } catch (err) {
        return next(err);
    }
});

/**
 * Compare password hashes
 */
userSchema.methods.comparePassword = async function (candidatePassword, cb) {
    try {
        let isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        return next(err);
    }
};

const User = mongoose.model("User", userSchema);
module.exports = User;