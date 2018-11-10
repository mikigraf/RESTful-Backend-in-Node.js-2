const passport = require("passport");
const express = require("express");
const router = express.Router();

const {
    Provider,
    Parent,
    Kid,
    Booking
} = require('../db/index');

router.get('/bookings', async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let items = await Booking.find({}).skip(page * limit).limit(limit);
            let count = await Booking.find({}).coundDocuments();
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
            let items = await Booking.find(req.query);
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

router.post('/bookings', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.delete('/bookings', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/bookings/:bookingId', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/bookings/:bookingId', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.delete('/bookings/:bookingId', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/bookings/:bookingId/kid', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/bookings/:bookingId/activity', async (req, res, next) => {
    try {

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});