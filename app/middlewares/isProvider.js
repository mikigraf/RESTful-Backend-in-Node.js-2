const {
    Provider
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isProvider(req, res, next) {
    try {
        let user = await Provider.findById(req.user._id);
        if (user.type.localeCompare('provider') === '0' || user.type.localeCompare('admin') === '0') {
            next();
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
    res.status(401);
    next();
}

module.exports = isProvider;