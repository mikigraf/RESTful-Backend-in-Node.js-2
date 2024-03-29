const passport = require("passport");
const express = require("express");
const router = express.Router();
const {
    Parent,
    Kid
} = require("../db/index");
const isAdmin = require("../middlewares/isAdmin");
const isAdminOrTargetUser = require("../middlewares/isAdminOrTargetUser");
const isAdminOrTargetParent = require('../middlewares/isAdminOrTargetParent')
const isParent = require('../middlewares/isParent');
const isProvider = require('../middlewares/isProvider');

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
            res.status(200).json({
                'items': ids
            });
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
var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
var uuidv4 = require('uuid/v4');

var s3 = new aws.S3({
    endpoint: process.env.S3_ENDPOINT,
    signatureVersion: 'v4',
    region: process.env.S3_REGION
});

var upload_pictures = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname
            });
        },
        key: function (req, file, cb) {
            cb(null, `pictures/${uuidv4()}${path.extname(file.originalname)}`);
        }
    })
});
router.post('/parents/:userId/avatar', [isAdminOrTargetUser, upload_pictures.single('avatar')], async (req, res, next) => {
    try {
        let title = req.file.originalname;
        let userId = req.user._id;

        let user = await Parent.findById(req.user._id);
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
router.post('/parents/:userId/kids', isAdminOrTargetParent, async (req, res, next) => {
    try {
        let new_kid = req.body.kid;
        let created_kid = await Kid.create(new_kid);

        let parent = await Parent.findById(req.params.userId);
        parent.kids.push(created_kid);
        parent.save();


        res.status(200).json(parent);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/parents/:userId/kids', async (req, res, next) => {
    try {
        let parent = await Parent.findById(req.params.userId);
        res.status(200).json(parent.kids);
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