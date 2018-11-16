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

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    categories: [{
        type: String
    }],
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    location: {
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        gps: {
            lan: {
                type: String,
                required: true
            },
            lon: {
                type: String,
                required: true
            }
        }
    },

    ratings: [{
        value: {
            type: Number
        },
        voter: {
            type: Schema.Types.ObjectId,
            ref: 'Parent'
        }

    }],

    pictures: [{
        url: {
            type: String
        },
        upload_date: {
            type: Date,
            default: Date.now
        }
    }],

    periodInDays: {
        type: Number,
        default: 0
    },

    startDays: [{
        type: Date
    }],

    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider'
    }

});

// Getter for price
activitySchema.path('price').get(function (num) {
    return (num / 100).toFixed(2);
});

// Setter for price
activitySchema.path('price').set(function (num) {
    return num * 100;
});

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;