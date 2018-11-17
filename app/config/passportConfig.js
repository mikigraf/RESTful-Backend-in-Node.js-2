const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const toBoolean = require('to-boolean');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pswgen = require('generate-password');

const {
    Parent,
    Provider,
    User
} = require('../db/index');

module.exports = function (passport) {
    passport.serializeUser((user, done) => {
        console.log("serialize user: " + user);
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        console.log("deserialize id: " + id);
        User.findById(id, (err, user) => {
            if (err || !user) {
                Parent.findById(id, (err, user) => {
                    if (err || !user) {
                        Provider.findById(id, (err, user) => {
                            done(err, user);
                        })
                    }
                    done(err, user);
                })
            }
            done(err, user);
        });
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done) => {
        const email = req.body.email;
        const type = req.body.type;


        if (type.localeCompare("parent") === 0) {
            try {
                const mobilePhoneNumber = req.body.mobilePhoneNumber;
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
                const mobilePhoneNumber = req.body.mobilePhoneNumber;
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

        if (type.localeCompare('admin') === 0) {
            try {
                console.log("Creating admin");
                const user = await User.create({
                    'username': username,
                    'password': password
                });
                done(user);
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

    passport.use('adminLogin', new LocalStrategy({
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
            var err, user = await Parent.findOne({
                id: jwt_payload.sub
            });
            if (user === null) {
                err,
                user = await Provider.findOne({
                    id: jwt_payload.sub
                });

                if (user === null) {
                    user = await User.findOne({
                        id: jwt_payload.sub
                    });
                    if (user) {
                        return done(null, user);
                    }
                }
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