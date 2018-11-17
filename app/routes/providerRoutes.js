const passport = require("passport");
const express = require("express");
const router = express.Router();
const {
    Provider
} = require("../db/index");
const isAdmin = require("../middlewares/isAdmin");
const isAdminOrTargetUser = require("../middlewares/isAdminOrTargetUser");
const isAdminOrTargetProvider = require('../middlewares/isAdminOrTargetProvider')
const isParent = require('../middlewares/isParent');
const isProvider = require('../middlewares/isProvider');

router.get('/providers', async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let users = await Provider.find({}).skip(page * limit).limit(limit);
            let count = await Provider.find({}).countDocuments();
            if (!users) {
                res.status(404).send('It seems like there are no users');
            }

            const ids = users.map(u => u._id);

            res.status(200).json({
                'count': count,
                'items': ids
            });
        } else {
            // query parameters are specified
            let users = await Provider.find(req.query);
            if (!users) {
                res.status(404).send('It seems like there are no providers');
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
router.post('/providers/:userId/avatar', [isAdminOrTargetUser, upload_pictures.single('avatar')], async (req, res, next) => {
    try {
        let title = req.file.originalname;
        let userId = req.user._id;

        let user = await Provider.findById(req.user._id);
        user.avatar = req.file.location;
        user.save();

        res.status(200).send('Profile picture has been saved succesfully.');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/providers/:userId/avatar', async (req, res, next) => {
    try {
        let current_user = await Provider.findById(req.params.userId);
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

module.exports = router;