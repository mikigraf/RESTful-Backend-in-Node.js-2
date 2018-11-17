const {
    User
} = require('../db/index');
const jwt = require('jsonwebtoken');

async function isAdmin(req, res, next) {
    try {
        let user = await User.findOne({
            username: req.user.username
        });
        if (user.type.localeCompare('admin') === 0) {
            next();
        } else {
            res.status(401);
        }

    } catch (error) {
        res.status(401).send();
    }
}

module.exports = isAdmin;