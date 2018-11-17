const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const toBoolean = require('to-boolean');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pswgen = require('generate-password');

const {
    Parent,
    Provider
} = require('../db/index');

module.exports = function (passport) {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done) => {
        const email = req.body.email;
        const type = req.body.type;
        const mobilePhoneNumber = req.body.mobilePhoneNumber;

        if (type.localeCompare("parent") === 0) {
            try {
                const parent = await Parent.create({
                    'email': email,
                    'username': username,
                    'password': password,
                    'type': type,
                    'mobilePhoneNumber': mobilePhoneNumber
                });
                done(parent);
            } catch (error) {
                done(error);
            }

        }

        if (type.localeCompare('provider') === 0) {
            try {
                const provider = await Provider.create({
                    'email': email,
                    'username': username,
                    'password': password,
                    'type': type,
                    'mobilePhoneNumber': mobilePhoneNumber
                });
                done(provider);
            } catch (error) {
                done(error);
            }
        }

    }));

    passport.use('parentLogin', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        try {
            const user = await Parent.findOne({
                'username': username
            });



            // User wasn't found
            if (!user) {
                return done(null, false, {
                    message: 'Wrong username or password.'
                });
            }

            // Password compare passwords
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, {
                    message: 'Wrong username or password.'
                });
            }

            // If everything went ok, send user information to the next middleware
            return done(null, user, {
                message: 'Logged in successfully'
            });
        } catch (error) {
            done(error);
        }
    }));

    passport.use('providerLogin', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        try {
            const user = await Provider.findOne({
                'username': username
            });



            // User wasn't found
            if (!user) {
                return done(null, false, {
                    message: 'Wrong username or password.'
                });
            }

            // Password compare passwords
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, {
                    message: 'Wrong username or password.'
                });
            }

            // If everything went ok, send user information to the next middleware
            return done(null, user, {
                message: 'Logged in successfully'
            });
        } catch (error) {
            done(error);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        try {
            const user = await User.findOne({
                'username': username
            });



            // User wasn't found
            if (!user) {
                return done(null, false, {
                    message: 'Wrong username or password.'
                });
            }

            // Password compare passwords
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, {
                    message: 'Wrong username or password.'
                });
            }

            // If everything went ok, send user information to the next middleware
            return done(null, user, {
                message: 'Logged in successfully'
            });
        } catch (error) {
            done(error);
        }
    }));

    var opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    };
    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            let err, user = await Parent.findOne({
                id: jwt_payload.sub
            });
            if (err) {
                let user = await Provider.findOne({
                    id: jwt_payload.sub
                });
                if (user) {
                    return done(null, user);
                } else if (error) {
                    return done(null, false);
                }
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            done(error);
        }
    }));
}