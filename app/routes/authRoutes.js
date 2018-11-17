const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pswgen = require('generate-password');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
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
    passport.authenticate('adminLogin', async (err, user, info) => {
        try {
            if (err || !user) {
                console.log("err: " + err);
                console.log("Err: user: " + user);
                const error = new Error('An error occured');
                return next(error);
            }
            req.login(user, {
                session: false
            }, async (error) => {
                if (error) return next(error);
                if (!user) {
                    return next(error);
                }
                const body = {
                    _id: user._id,
                    username: user.username,
                    type: user.type
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


router.post('/login/parent', async (req, res, next) => {
    passport.authenticate('parentLogin', async (err, user, info) => {
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
                    username: user.username,
                    type: user.type
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
})
router.post('/login/provider', async (req, res, next) => {
    passport.authenticate('providerLogin', async (err, user, info) => {
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
                    username: user.username,
                    type: user.type
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
router.post('/providers/forgot', async (req, res, next) => {
    try {
        let user = await Provider.findOne({
            'username': req.body.username
        });

        if (user) {
            const password = pswgen.generate({
                length: 10,
                numbers: true
            });

            user.password = password;

            user.save();
            let phone_number = user.mobilePhoneNumber;
            twilioClient.messages
                .create({
                    body: 'This is your new password for Kidshub: ' + password,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                })
                .then(message => console.log(message.sid))
                .done();
            res.send(200);
        }
    } catch (error) {
        return next(error);
    }
});

router.post('/parents/forgot', async (req, res, next) => {
    try {
        let user = await Parent.findOne({
            'username': req.body.username
        });

        if (user) {
            const password = pswgen.generate({
                length: 10,
                numbers: true
            });

            user.password = password;

            user.save();
            let phone_number = user.mobilePhoneNumber;
            if (process.env.USE_TWILIO.localeCompare('YES')) {
                const twilioClient = require('twilio')(accountSid, authToken);
                twilioClient.messages
                    .create({
                        body: 'This is your new password for Kidshub: ' + password,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: phone_number
                    })
                    .then(message => console.log(message.sid))
                    .done();
            }
            res.send(200);
        }
    } catch (error) {
        return next(error);
    }
});
module.exports = router;