const passport = require("passport");
const express = require("express");
const router = express.Router();

const isParent = require('../middlewares/isParent');
const isProvider = require('../middlewares/isProvider');

const {
    Provider,
    Parent,
    Kid,
    Booking
} = require('../db/index');

const request = require('async-request');
const xml2js = require('xml2js');

router.get('/bookings', async (req, res, next) => {
    try {
        var page = parseInt(req.query.page) || 0;
        var limit = parseInt(req.query.limit) || 100;

        if (Object.keys(req.query).length === 0) {
            // no query parameters, find all users without any filtering
            let items = await Booking.find({}).skip(page * limit).limit(limit);
            let count = await Booking.find({}).countDocuments();
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
            res.status(200).json({
                'items': ids
            });
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/bookings', async (req, res, next) => {
    try {
        let booking = await Booking.create(req.body.booking);
        if (!booking) {
            res.status(500).send('Internal server error');
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/bookings/:bookingId', async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            res.status(500).send('Internal server error');
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/bookings/:bookingId', async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            res.status(500).send('Internal server error');
        }

        if (req.user.type.localeCompare('admin') || req.user._id === booking.buyer) {
            let booking = await Booking.findByIdAndUpdate(req.params.bookingId, req.body.booking);
            res.status(200).json(booking);
        };

        res.status(401).send('Unauthorized');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/bookings/:bookingId/pay', async (req, res, next) => {
    try {
        var booking = await Booking.findById(req.params.bookingId).populate('activity');

        if (!booking) {
            res.status(500).send('Internal server error');
        }

        let url = "https://test.myfatoorah.com/pg/PayGatewayService.asmx";
        let user = "testapi@myfatoorah.com";
        let password = "E55D0";

        let merchant_code = process.env.MYFATOORAH_MERCHANT_CODE;
        // let merchant_reference = process.env.MYFATOORAH_MERCHANT_REFERENCE;
        let merchant_reference = booking._id;
        let merchant_name = process.env.MYFATOORAH_MERCHANT_NAME;
        let merchant_password = process.env.MYFATOORAH_MERCHANT_PASSWORD;
        let merchant_error_url = process.env.MYFATOORAH_MERCHANT_ERROR_URL;
        let merchant_return_url = '/bookings/' + booking._id + '/pay/success';

        let return_url = 'http://events.joincoded.com';
        let error_url = 'http://events.joincoded.com';

        let payment_request = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
            `<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"> ` +
            `<soap:Body>` +
            `<PaymentRequest xmlns=\"http://tempuri.org/\">` +
            `<req>` +
            `<CustomerDC>` +
            `<Name>'${req.user.username}'</Name>` +
            ` <Email>'${req.user.email}'</Email>` +
            ` <Mobile'${req.user.mobilePhoneNumber}'</Mobile>` +
            ` </CustomerDC>` +
            ` <MerchantDC>` +
            ` <merchant_code>${merchant_code}</merchant_code>` +
            ` <merchant_username>${merchant_name}</merchant_username>` +
            ` <merchant_password>${merchant_password}</merchant_password>` +
            ` <merchant_ReferenceID>${merchant_reference}</merchant_ReferenceID>` +
            ` <ReturnURL>${merchant_return_url}</ReturnURL>` +
            ` <merchant_error_url>${merchant_error_url}</merchant_error_url>` +
            ` </MerchantDC>` +
            ` <lstProductDC>` +
            ` <ProductDC>` +
            ` <product_name>${booking.activity.title}</product_name>` +
            ` <unitPrice>${booking.activity.price}</unitPrice>` +
            ` <qty>1</qty>` +
            ` </ProductDC>` +
            ` </lstProductDC>` +
            ` </req>` +
            ` </PaymentRequest>` +
            ` </soap:Body>` +
            ` </soap:Envelope>`

        headers = {
            'Host': 'www.myfatoorah.com',
            'Content-Type': 'text/xml',
            'Content-Length': request.length,
            'SOAPAction': 'http://tempuri.org/PaymentRequest'
        }

        let response = await request(
            'https://www.myfatoorah.com/pg/PayGatewayService.asmx', {
                method: 'POST',
                headers: headers,
                data: payment_request,
            }
        )

        let regex1 = '<paymentURL *[^>]*>.*</paymentURL *>';
        var paymentUrlRaw = response.body.search(regex1);
        let paymentUrl = paymentUrlRaw.replace('<paymentURL>').replace('</paymentURL>');
        res.status(200).send(paymentUrl);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/bookings/:bookingId/pay/success', async (req, res, next) => {
    try {
        var booking = await Booking.findById(req.params.bookingId).populate('activity');
        if (!booking) {
            res.status(500).send('Internal server error');
        }
        booking.isPaid = true;
        booking.save();

        res.status(200).json(booking);

    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.delete('/bookings/:bookingId', async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.bookingId);
        if (booking && req.user._id === booking.buyer) {
            await Booking.findByIdAndRemove(req.params.bookingId)
        } else {
            res.status(401).send('Unauthorized');
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/bookings/:bookingId/kid', async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.bookingId).populate('kids');
        if (!booking) {
            res.status(500).send('Internal server error');
        }

        res.status(200).json(booking.kids);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/bookings/:bookingId/activity', async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.bookingId).populate('activity');
        if (!booking) {
            res.status(500).send('Internal server error');
        }

        res.status(200).json(booking.activity);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;