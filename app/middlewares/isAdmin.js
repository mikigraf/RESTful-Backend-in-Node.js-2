const {
    User
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isAdmin(req, res, next) {
    try {
        let user = await User.findById(req.user._id);
        if (user.type.localeCompare('admin') === '0') {
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