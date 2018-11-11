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

const bookingSchema = new mongoose.Schema({
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'Parent',
        required: true
    },
    kids: [{
        type: Schema.Types.ObjectId,
        ref: 'Kid',
        required: true
    }],
    activity: {
        type: Schema.Types.ObjectId,
        ref: 'Actvitity',
        required: true
    },
    isWishlist: {
        type: Boolean,
        required: true
    },
    transaction: {
        type: String
    },
    isPaid: {
        type: Boolean,
        default: false
    }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;