const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../db/models/user');
const pswgen = require('generate-password');
const emailTransporter = require('../config/nodemailerConfig');

/**
 * @api {post} /signup Register 
 * @apiName Signup new user with local strategy
 * @apiGroup Authentication
 * 
 * @apiSuccess {Object} user user object. 
 * 
 * @apiExample {curl} Example usage:
 *          curl --data-urlencode "email=test@test.com&username=test&password=testpassword&firstName=John&lastName=Mustermann&address=Brahmsstrasse 3 11111 Berlin&birthday=06.10.1987&status=guest"
 * 
 * @apiError UserNotFound The id of the User was not found.
 * @apiError SignupsOff Club has deactivated registration.
 */
router.post('/signup', passport.authenticate('signup', {
    session: false
}), async (req, res, next) => {
    res.status(201).json({
        message: 'Signup successful',
        user: req.user
    });
});

/**
 * @api {post} /login Login 
 * @apiName Login using local strategy
 * @apiGroup Authentication
 * 
 * @apiSuccess {String} String Json Web Token for use with Authorization/Bearer header.
 * 
 */
router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error('An error occured');
                return next(error);
            }
            req.login(user, {
                session: false
            }, async (error) => {
                if (error) return next(error);

                const body = {
                    _id: user._id,
                    username: user.username
                };
                const token = jwt.sign({
                    user: body
                }, process.env.JWT_SECRET);
                return res.json({
                    token
                });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

/**
 * @api {post} /forgot Forgot Password 
 * @apiName Remind users password
 * @apiGroup Authentication
 * 
 * @apiSuccess {String} username of registered user. 
 * 
 */
router.post('/forgot', async (req, res, next) => {
    try {
        let user = await User.findOne({
            'username': req.body.username
        });

        if (user) {
            const password = pswgen.generate({
                length: 10,
                numbers: true
            });

            user.password = password;

            user.save();

            const mailOptions = {
                from: process.env.CLIENT_EMAIL_ADDRESS,
                to: user.email,
                subject: 'Password reminder from WSIT',
                text: 'Password: ' + password + ' login: ' + user.username
            };
            emailTransporter.sendMail(mailOptions);
            res.send(200);
        }
    } catch (error) {
        return next(error);
    }
});
module.exports = router;