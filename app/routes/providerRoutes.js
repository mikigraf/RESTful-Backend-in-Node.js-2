const passport = require("passport");
const express = require("express");
const router = express.Router();
const {
    Provider
} = require("../db/index");

const isAdmin = require("../middlewares/isAdmin");
const isAdminOrTargetUser = require("../middlewares/isAdminOrTargetUser");

router.get('/providers', isAdmin, async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let users = await Provider.find({}).skip(page * limit).limit(limit);
            let count = await Provider.find({}).coundDocuments();
            if (!users) {
                res.status(404).send('It seems like there are no users');
            }

            const ids = users.map(u => u._id);

            res.status(200).json({
                'count': count,
                'providers': ids
            });
        } else {
            // query parameters are specified
            let users = await Provider.find(req.query);
            if (!users) {
                res.status(404).send('It seems like there are no providers');
            }

            const ids = users.map(u => u._id);
            res.status(200).json(ids);
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/providers/:userId', async (req, res, next) => {
    try {
        let user = await Provider.findById(req.params.userId);
        user.password = "";
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/providers/:userId', isAdminOrTargetProvider, async (req, res, next) => {
    try {
        let user = await Provider.findOneAndUpdate({
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

router.delete('/providers/:userId', isAdminOrTargetProvider, async (req, res, next) => {
    try {
        let err = await Provider.remove({
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