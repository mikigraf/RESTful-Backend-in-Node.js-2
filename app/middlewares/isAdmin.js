const {
    User
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isAdmin(req, res, next) {
    try {
        console.log("is admin: " + req.user);
        if (req.user.type.localeCompare('admin') === '0') {
            next();
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
    res.status(401);
    next();
}

module.exports = isAdmin;