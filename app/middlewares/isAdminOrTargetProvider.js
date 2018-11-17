const {
    User,
    Provider
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isAdminOrTargetProvider(req, res, next) {
    try {
        let user = await Provider.findById(req.user._id);
        if (user.type.localeCompare('admin') === '0') {
            next();
        }

        if (req.user._id === req.params.userId) {
            next();
        }
    } catch (error) {
        res.status(401);
        next(error);
    }
    res.status(401);
    next();
}

module.exports = isAdminOrTargetProvider;