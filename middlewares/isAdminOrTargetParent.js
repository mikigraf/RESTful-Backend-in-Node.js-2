const Parent = require('../db/models/parent');
const jwt = require('jsonwebtoken');

async function isAdminOrTargetUser(req, res, next) {
    try {
        let user = await Parent.findById(req.user._id);
        if (user.type.localeCompare('admin') === '0') {
            next();
        }

        if (req.user._id === req.params.userId) {
            next();
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
    res.status(401);
    next();
}

module.exports = isAdminOrTargetUser;