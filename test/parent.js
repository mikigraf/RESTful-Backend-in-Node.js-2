const mongoose = require("mongoose");
const Parent = require("../app/db/models/parent");

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

const parent1 = {
    email: "1@parent.com",
    username: "parent",
    password: "parent10",
    mobilePhoneNumber: "17664593",
    type: "parent"
};

var parent_token = "";

describe("Parents", () => {
    before(done => {
        Parent.deleteMany({}, () => {});;
        request(server)
            .post("/api/auth/signup")
            .send(parent1)
            .then(res => {
                done();
            });
    });

    beforeEach(done => {
        request(server)
            .post("/api/auth/login")
            .send({
                username: parent1.username,
                password: parent1.password,
                type: "parent"
            })
            .expect(200)
            .then(res => {
                expect(res.body).to.have.property("token");
                parent_token = `Bearer ${res.body.token}`;
                console.log(parent_token);
                done();
            });
    });

    describe("/POST kid", () => {
        it("should create new child for this parent", done => {
            Parent.findOne({
                username: parent1.username
            }).then(user => {
                chai.request(server)
                    .post(`/api/parents/${user.id}/kids`)
                    .set('authorization', parent_token)
                    .set('content-type', 'application/json')
                    .send({
                        kid: {
                            name: 'John',
                            parent: user._id,
                            age: 12,
                            gender: 'male'
                        }
                    }).end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
            })
        });
    });

    describe("/GET kids", () => {
        it("should return list of references to kids for this parent", done => {
            Parent.findOne({
                username: parent1.username
            }).then(user => {
                chai.request(server).get(`/api/parents/${user.id}/kids`)
                    .set('authorization', parent_token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
        })
    })



})