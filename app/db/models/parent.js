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

const parentSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        validate: [
            validate({
                validator: 'isEmail',
                message: 'Not a valid email'
            })
        ]
    },
    username: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['parent', 'provider', 'admin'],
        default: 'parent'
    },

    avatar: {
        type: String,
    },

    mobilePhoneNumber: {
        type: String,
        required: true
    },

    kids: [{
        type: Schema.Types.ObjectId,
        ref: 'Kid'
    }],

    bookings: [{
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }],

    liked: [{
        type: Schema.Types.ObjectId,
        ref: ''
    }],

});

parentSchema.pre('save', async function (next) {
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
parentSchema.methods.comparePassword = async function (candidatePassword, cb) {
    try {
        let isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        return next(err);
    }
};

const Parent = mongoose.model("Parent", parentSchema);
module.exports = Parent;