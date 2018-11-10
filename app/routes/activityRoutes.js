const passport = require("passport");
const express = require("express");
const router = express.Router();

const {
    Provider,
    Parent,
    Kid,
    Activity
} = require("../db/index");

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

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post("/activities/:activityId", async (req, res, next) => {
    try {

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

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/location", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get("/activities/:activityId/pictures", async (req, res, next) => {
    try {

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

router.get("/activities/:activityId/wishlist", async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});