const {
    Parent,
    User
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isParent(req, res, next) {
    try {
        if (req.user.type.localeCompare('admin') === 0) {
            let user = await User.findOne({
                username: req.user.username
            });

            if (user.type.localeCompare('admin') === 0) {
                next();
            }
        } else if (req.user.type.localeCompare('parent') === 0) {
            let user = await Parent.findOne({
                username: req.user.username
            });
            if (user.type.localCompare('parent') === 0) {
                next();
            }
        } else {
            res.staus(401);
        }
    } catch (error) {
        res.status(401);
    }
}

module.exports = isParent;