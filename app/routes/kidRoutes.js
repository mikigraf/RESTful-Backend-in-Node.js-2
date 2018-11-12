const passport = require("passport");
const express = require("express");
const router = express.Router();

const isParent = require('../middlewares/isParent');
const isProvider = require('../middlewares/isProvider');

const {
    Kid
} = require("../db/index");
const isAdmin = require("../middlewares/isAdmin");
router.get('/kids/:kidId', async (req, res, next) => {

});
router.post('/kids/:kidId', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/kids', async (req, res, next) => {
    try {
        try {
            var page = parseInt(req.query.page) || 0;
            var limit = parseInt(req.query.limit) || 100;

            if (Object.keys(req.query).length === 0) {
                // no query parameters, find all users without any filtering
                let kids = await Kid.find({}).skip(page * limit).limit(limit);
                let count = await Kid.find({}).coundDocuments();
                if (!kids) {
                    res.status(404).send('It seems like there are no kids');
                }

                const ids = kids.map(u => u._id);

                res.status(200).json({
                    'count': count,
                    'providers': ids
                });
            } else {
                // query parameters are specified
                let kids = await Kid.find(req.query);
                if (!users) {
                    res.status(404).send('It seems like there are no providers');
                }

                const ids = kids.map(u => u._id);
                res.status(200).json({
                    'items': ids
                });
            }
        } catch (error) {
            res.status(500).send('Internal server error');
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;