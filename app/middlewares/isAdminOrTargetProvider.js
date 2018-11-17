const Provider = require('../db/models/provider');
const jwt = require('jsonwebtoken');

async function isAdminOrTargetProvider(req, res, next) {
    try {
        console.log("REQ USER: " + req.user);
        let user = await Provider.findById(req.user._id);
        if (user.type.localeCompare('admin') === '0') {
            next();
        }

        if (user.type.localeCompare('provider') === '0') {
            next();
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
    res.status(401);
    next();
}

module.exports = isAdminOrTargetProvider;