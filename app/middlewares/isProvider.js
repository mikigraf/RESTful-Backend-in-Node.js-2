const {
    Provider
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isProvider(req, res, next) {
    try {
        if (req.user.type.localeCompare('provider') === '0' || req.user.type.localeCompare('admin') === '0') {
            next(req.user);
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
    res.status(401);
    next();
}

module.exports = isProvider;