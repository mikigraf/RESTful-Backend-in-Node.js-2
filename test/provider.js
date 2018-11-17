const mongoose = require("mongoose");
const Provider = require("../app/db/models/provider");

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
        Provider.deleteMany({}, () => {});
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
                password: provider1.password,
                type: 'provider'
            })
            .expect(200)
            .then(res => {
                expect(res.body).to.have.property("token");
                provider_token = `Bearer ${res.body.token}`;
                done();
            });
    });

})