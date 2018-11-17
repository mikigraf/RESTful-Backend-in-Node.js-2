const mongoose = require("mongoose");
const {
    Activity,
    Booking,
    Kid,
    Parent,
    Provider,
    User
} = require('../app/db/index');


const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");
const should = chai.should();
const request = require("supertest");
const expect = require("chai").expect;
const sinon = require("sinon");

const chaiJsonEqual = require("chai-json-equal");

chai.use(chaiJsonEqual);

chai.use(chaiHttp);

const provider1 = {
    email: "1@provider.com",
    username: "provider",
    password: "provider10",
    type: "provider",
    mobilePhoneNumber: 1766455893
};

var provider_token = "";

describe("Provider", () => {
    before(done => {
        User.deleteMany({}, () => {});
        Kid.deleteMany({}, () => {});
        Provider.deleteMany({}, () => {});
        Activity.deleteMany({}, () => {});
        Parent.deleteMany({}, () => {});
        Booking.deleteMany({}, () => {});
        request(server)
            .post("/api/auth/signup")
            .send(provider1)
            .then(res => {
                done();
            });
    });

    beforeEach(done => {
        request(server)
            .post("/api/auth/login/provider")
            .send({
                username: provider1.username,
                password: provider1.password
            })
            .expect(200)
            .then(res => {
                expect(res.body).to.have.property("token");
                provider_token = `Bearer ${res.body.token}`;
                done();
            });
    });

    describe("/PUT activities", () => {
        it("should create new activity for this provider", done => {
            Provider.findOne({
                username: provider1.username
            }).then(user => {
                chai.request(server)
                    .put(`/api/activities`)
                    .set('authorization', provider_token)
                    .set('content-type', 'application/json')
                    .send({
                        activity: {
                            provider: user._id,
                            title: 'Test Acitivty',
                            categories: ['fun', 'learning'],
                            description: 'Fun activity that teaches kids alot',
                            price: 100,
                            location: {
                                city: 'Paris',
                                street: 'Pariserstr. 12',
                                gps: {
                                    lan: '51.5655',
                                    lon: '55.5555'
                                },
                            },
                            periodInDays: 1,
                            startDays: [Date.now()]
                        }
                    }).end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
            })
        });
    });

})