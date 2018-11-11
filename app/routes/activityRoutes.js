const passport = require("passport");
const express = require("express");
const router = express.Router();

const {
    Provider,
    Parent,
    Kid,
    Activity
} = require("../db/index");

const {
    upload_pictures,
    s3
} = require('../config/s3');

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

router.delete("/activities", isAdmin, async (req, res, next) => {
    try {

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

        let picturesPaths = activity.pictures;
        let picturesUrls = [];
        // get signed url for all of them
        picturesPaths.forEach((path) => {
            let url = s3.getSignedUrl('getObject', {
                Bucket: 'pictures',
                Key: path,
                Expires: 60 * 60 // h expiration time for the signed url
            });
            picturesUrls.push(url);
        });

        res.status(200).json(picturesUrls);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});
router.post("/activities/:activityId/pictures", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/ratings", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});
// create new rating
router.post("/activities/:activityId/ratings", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/provider", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/bookings", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post("/activities/:activityId/wishlist", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});