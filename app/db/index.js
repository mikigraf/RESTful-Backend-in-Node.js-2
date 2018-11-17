/** 
 * Connect to MongoDB
 */
const chalk = require('chalk');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect('mongodb://adminek:adminek1@ds253243.mlab.com:53243/kidshub-dev', {
    keepAlive: true
});
// if (process.env.localeCompare('DEV') === 0) {
//     mongoose.connect(process.env.MONGODB_URI_DEV, {
//         keepAlive: true
//     });
// } else {
//     // production
//     mongoose.connect(process.env.MONGODB_URI, {
//         keepAlive: true
//     });
// }

mongoose.connection.on('connected', (success) => {
    console.log(chalk.green('✓ '), chalk.green('MongoDB connection was succesful.'));
});

mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log(chalk.red('✗ '), chalk.red('MongoDB connection error. Please make sure that MongoDB is running.'));
    process.exit();
});

module.exports.Parent = require("./models/parent");
module.exports.Provider = require("./models/provider");
module.exports.Kid = require("./models/kid");
module.exports.User = require("./models/user");

module.exports.Activity = require("./models/activity");
module.exports.Booking = require("./models/booking");