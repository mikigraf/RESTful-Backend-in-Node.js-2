const {
    Parent
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isParent(req, res, next) {
    try {
        let user = await Parent.findById(req.user._id);
        console.log("USER: " + JSON.stringify(user));
        if (user.type.localeCompare('parent') === '0' || user.type.localeCompare('admin') === '0') {
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