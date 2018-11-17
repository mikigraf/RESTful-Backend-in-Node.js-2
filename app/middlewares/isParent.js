const {
    Parent,
    User
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isParent(req, res, next) {
    try {
        console.log("isParent user: " + req.user);
        var user = null;
        if (req.user.type.localeCompare('admin') === 0) {
            user = await User.findById(req.user._id);
        } else if (req.user.type.localeCompare('parent') === 0) {
            user = await Parent.findById(req.user._id);
        }

        if (user.type.localeCompare(req.user.type) === '0') {
            next();
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
    res.status(401);
    next();
}

module.exports = isParent;