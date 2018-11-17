const mongoose = require("mongoose");
const User = require("../app/db/models/user");

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
        User.deleteMany({}, () => {});;
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
                console.log(admin_token);
                done();
            });
    });

    describe("/GET parents", () => {
        User.findOne({
            username: admin1.username
        }).then(user => {
            console.log("test users: " + user);
            chai.request(server).get('/api/parents').set('authorization', admin_token).end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });
    });




})