const passport = require("passport");
const express = require("express");
const router = express.Router();
const {
    User
} = require("../db/index");

const isAdmin = require("../middlewares/isAdmin");
const isAdminOrTargetUser = require("../middlewares/isAdminOrTargetUser");
const isParent = require('../middlewares/isParent');
const isProvider = require('../middlewares/isProvider');

router.get('/users', isAdmin, async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let users = await User.find({}).skip(page * limit).limit(limit);
            let count = await User.find({}).countDocuments();
            if (!users) {
                res.status(404).send('It seems like there are no users');
            }

            const ids = users.map(u => u._id);

            res.status(200).json({
                'count': count,
                'users': ids
            });
        } else {
            // query parameters are specified
            let users = await User.find(req.query);
            if (!users) {
                res.status(404).send('It seems like there are no users');
            }

            const ids = users.map(u => u._id);
            res.status(200).json(ids);
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/users/:userId', async (req, res, next) => {
    try {
        let user = await User.findById(req.params.userId);
        user.password = "";
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/users/:userId', isAdminOrTargetUser, async (req, res, next) => {
    try {
        let user = await User.findOneAndUpdate({
                _id: req.params.id
            },
            req.body.user, {
                upsert: true
            }
        );

        if (!user) {
            res.status(401).send('Unauthorized.');
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.delete('/users/:userId', isAdminOrTargetUser, async (req, res, next) => {
    try {
        let err = await User.remove({
            _id: req.params.id
        });

        if (err) {
            res.status(500).send('Internal server error');
        }

        res.status(200).send('User has been deleted succesfully');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;