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

const admin1 = {
    username: "admin",
    password: "admin",
    type: "admin"
};

var admin_token = "";

describe("Admins", () => {
    before(done => {
        User.deleteMany({}, () => {});
        Kid.deleteMany({}, () => {});
        Provider.deleteMany({}, () => {});
        Activity.deleteMany({}, () => {});
        Parent.deleteMany({}, () => {});
        Booking.deleteMany({}, () => {});
        request(server)
            .post("/api/auth/signup")
            .send(admin1)
            .then(res => {
                done();
            });
    });

    beforeEach(done => {
        request(server)
            .post("/api/auth/login")
            .send({
                username: admin1.username,
                password: admin1.password
            })
            .expect(200)
            .then(res => {
                expect(res.body).to.have.property("token");
                admin_token = `Bearer ${res.body.token}`;
                done();
            });
    });

    describe("/GET parents", () => {
        it("should get a list of parents", done => {
            User.findOne({
                username: admin1.username
            }).then(user => {
                chai.request(server).get('/api/parents').set('authorization', admin_token).end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
            });
        })
    });




})