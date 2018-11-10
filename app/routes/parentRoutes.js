const passport = require("passport");
const express = require("express");
const router = express.Router();
const {
    Parent,
    Kid
} = require("../db/index");
const {
    upload_pictures,
    s3
} = require('../config/s3');
const isAdmin = require("../middlewares/isAdmin");
const isAdminOrTargetUser = require("../middlewares/isAdminOrTargetUser");

router.get('/parents', isAdmin, async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let users = await Parent.find({}).skip(page * limit).limit(limit);
            let count = await Parent.find({}).coundDocuments();
            if (!users) {
                res.status(404).send('It seems like there are no users');
            }

            const ids = users.map(u => u._id);

            res.status(200).json({
                'count': count,
                'parents': ids
            });
        } else {
            // query parameters are specified
            let users = await Parent.find(req.query);
            if (!users) {
                res.status(404).send('It seems like there are no parents');
            }

            const ids = users.map(u => u._id);
            res.status(200).json(ids);
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/parents/:userId', async (req, res, next) => {
    try {
        let user = await Parent.findById(req.params.userId);
        user.password = "";
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/parents/:userId/avatar', [isAdminOrTargetUser, upload_pictures.single('avatar')], async (req, res, next) => {
    try {
        let title = req.file.originalname;
        let userId = req.user.id;

        let user = await Parent.findById(req.user.id);
        user.avatar = req.file.location;
        user.save();

        res.status(200).send('Profile picture has been saved succesfully.');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/parents/:userId/avatar', async (req, res, next) => {
    try {
        let current_user = await Parent.findById(req.params.userId);
        const url = s3.getSignedUrl('getObject', {
            Bucket: 'pictures',
            Key: current_user.avatar,
            Expires: 60 * 60 // 1h expiration time for the url
        });

        res.status(200).json(url);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/parents/:userId', isAdminOrTargetParent, async (req, res, next) => {
    try {
        let user = await Parent.findOneAndUpdate({
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

router.delete('/parents/:userId', isAdminOrTargetParent, async (req, res, next) => {
    try {
        let err = await Parent.remove({
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

// add 1 kid
router.post('/parents/:userId/kids', isAdminOrTargetUser, async (req, res, next) => {
    try {
        // array containing kids objects
        let new_kid = req.body.kid;
        let created_kid, err = await Kid.create(new_kid);
        if (err) {
            res.status(500).send('Internal server error');
        }

        let parent = await Parent.findByIdAndUpdate({
            _id: req.user._id
        }, {
            "$push": {
                "kids": created_kid._id
            }
        });

        res.status(200).json(parent);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

// delete 1 kid
router.delete('/parents/:userId/kids', isAdminOrTargetUser, async (req, res, next) => {
    try {
        // kid id
        let kid_to_remove = req.body.kid;
        let parent, err = await Parent.update({
            _id: kid_to_remove
        }, {
            $pullAll: {
                _id: req.body.kid
            }
        });

        if (err) {
            res.status(500).send('Internal server error');
        }

        await Kid.remove({
            _id: kid_to_remove
        })

        res.status(200).send(parent);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});




module.exports = router;