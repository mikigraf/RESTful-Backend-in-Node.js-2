const passport = require("passport");
var express = require('express');
const router = express.Router();

var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
var uuidv4 = require('uuid/v4');

var s3 = new aws.S3({
    endpoint: process.env.S3_ENDPOINT,
    signatureVersion: 'v4',
    region: process.env.S3_REGION
});

const {
    Provider,
    Parent,
    Kid,
    Activity
} = require("../db/index");

const isAdmin = require('../middlewares/isAdmin');
router.get("/activities", async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let items = await Activity.find({}).skip(page * limit).limit(limit);
            let count = await Activity.find({}).coundDocuments();
            if (!items) {
                res.status(404).send('It seems like there are no kids');
            }

            const ids = items.map(u => u._id);

            res.status(200).json({
                'count': count,
                'items': ids
            });
        } else {
            // query parameters are specified
            let items = await Activity.find(req.query);
            if (!items) {
                res.status(404).send('It seems like there are no providers');
            }

            const ids = items.map(u => u._id);
            res.status(200).json(ids);
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post("/activities", isAdmin, async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let activities = await Activity.find({}).skip(page * limit).limit(limit);
            let count = await Activity.find({}).coundDocuments();
            if (!activities) {
                res.status(404).send('It seems like there are no users');
            }

            const ids = activities.map(u => u._id);

            res.status(200).json({
                'count': count,
                'items': ids
            });
        } else {
            // query parameters are specified
            let activities = await Activity.find(req.query);
            if (!activities) {
                res.status(404).send('It seems like there are no providers');
            }

            const ids = activities.map(u => u._id);
            res.status(200).json({
                'items': ids
            });
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId", async (req, res, next) => {
    try {
        let activity = await Activity.findById(req.params.activityId).populate('provider').populate('ratings.voter');
        if (!activity) {
            res.status(500).send('Internal server error');
        }

        res.status(200).send(activity);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post("/activities/:activityId", async (req, res, next) => {
    try {
        let activity = await Activity.findByIdAndUpdate(req.params.activityId, req.body.activity, {
            new: true
        });

        if (!activity) {
            res.status(500).send('Internal server error');
        }

        res.status(200).send(activity);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.delete("/activities/:activityId", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/categories", async (req, res, next) => {
    try {
        let activity = await Activity.findById(req.params.activityId);
        if (!activity) {
            res.status(500).send('Internal server error');
        }

        res.status(200).json(activity.categories);

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/location", async (req, res, next) => {
    try {
        let activity = Activity.findById(req.params.activityId);
        if (!activity) {
            res.status(500).send('Internal server error');
        }

        res.status(200).json(activity.location);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/pictures", async (req, res, next) => {
    try {
        let activity = Activity.findById(req.params.activityId);
        if (!activity) {
            res.status(500).send('Internal server error');
        }

        // let picturesPaths = activity.pictures;
        // let picturesUrls = [];
        // get signed url for all of them
        // picturesPaths.forEach((path) => {
        //     let url = s3.getSignedUrl('getObject', {
        //         Bucket: 'pictures',
        //         Key: path,
        //         Expires: 60 * 60 // h expiration time for the signed url
        //     });
        //     picturesUrls.push(url);
        // });

        res.status(200).json(activity.pictures);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

// add 1 picture 
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
router.post("/activities/:activityId/pictures", upload_pictures.single('picture'), async (req, res, next) => {
    try {
        let title = req.file.originalname;
        let userId = req.user._id;
        let activity = await Activity.findById(req.params.activityId);
        activity.pictures.push(req.file.location);
        activity.save();
        res.status(200).json(activity);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/ratings", async (req, res, next) => {
    try {
        let activity = await Activity.findById(req.params.activityId).populate('ratings.voter');
        if (!activity) {
            res.status(500).send('Internal server error');
        }

        res.status(200).json(activity.ratings);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});
// create new rating
router.post("/activities/:activityId/ratings", async (req, res, next) => {
    try {
        let activity = await Activity.findById(req.params.activityId);
        activity.ratings.push(
            req.body.rating
        );
        activity.save();
        res.status(200).json(activity);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/provider", async (req, res, next) => {
    try {
        let activity = await Activity.findById(req.params.activityId).populate('provider');
        res.status(200).json(activity.provider);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/bookings", async (req, res, next) => {
    try {
        let bookings = await Activity.findAll({
            'activity': req.params.activityId
        })
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post("/activities/:activityId/wishlist", async (req, res, next) => {
    try {
        let parent = await Parent.findById(req.user._id);
        parent.wishlist.push(req.params.activityId);
        parent.save();
        res.status(200).json(parent);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;