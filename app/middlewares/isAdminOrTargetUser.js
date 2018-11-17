const User = require('../db/models/user');
const jwt = require('jsonwebtoken');

async function isAdminOrTargetUser(req, res, next) {
    try {
        if (req.user.type.localeCompare('admin') === 0) {

        } else if (req.user.type.localeCompare('parent') === 0) {

        } else {
            res.staus(401);
        }


    } catch (error) {
        res.status(401);
    }
}

module.exports = isAdminOrTargetUser;