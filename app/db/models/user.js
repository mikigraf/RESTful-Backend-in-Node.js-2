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