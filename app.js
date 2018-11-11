const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const logger = require('morgan');
const dotenv = require('dotenv');
const passport = require('passport');
const compression = require('compression');
const expressValidator = require('express-validator');
const helmet = require('helmet');

/** 
 * Load environmental variables from .env file, where API keys and passwords are configured
 */
dotenv.load({
    path: '.env'
});

/** 
 * Create express server
 */
const app = express();
app.use(require('express-status-monitor')());

/** 
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(expressValidator());

app.use(passport.initialize());
require('./app/config/passportConfig')(passport);

/**
 * Initialize database connection
 */
require('./app/db/index');

const authRoutes = require('./app/routes/authRoutes');
app.use('/api/auth/', authRoutes);

const activityRoutes = require('./app/routes/activityRoutes');
app.use('/api/', activityRoutes);

const bookingRoutes = require('./app/routes/bookingRoutes');
app.use('/api/', bookingRoutes);

const kidRoutes = require('./app/routes/kidRoutes');
app.use('/api/', kidRoutes);

const parentRoutes = require('./app/routes/parentRoutes');
app.use('/api/', parentRoutes);

const providerRoutes = require('./app/routes/providerRoutes');
app.use('/api/', providerRoutes);

const userRoutes = require('./app/routes/userRoutes');
app.use('/api/', userRoutes);

app.use('/api/auth/test', passport.authenticate('jwt'), (req, res, next) => {
    res.send(200);
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;