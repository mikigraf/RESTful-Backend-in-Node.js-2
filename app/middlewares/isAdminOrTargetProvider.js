const {
    User,
    Provider
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isAdminOrTargetProvider(req, res, next) {
    try {
        if (req.user.type.localeCompare('admin') === 0) {
            let user = await User.findOne({
                username: req.user.username
            });

            if (user.type.localeCompare('admin') === 0) {
                next();
            }
        } else if (req.user.type.localeCompare('provider') === 0) {
            let user = await Provider.findOne({
                username: req.user.username
            });
            if (user.type.localCompare('provider') === 0) {
                next();
            }
        } else {
            res.staus(401);
        }
    } catch (error) {
        res.status(401);
    }
}

module.exports = isAdminOrTargetProvider;