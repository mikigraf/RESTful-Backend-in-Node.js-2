var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
var uuidv4 = require('uuid/v4');

var s3 = new aws.S3({
    endpoint: process.env.S3_ENDPOINT,
    signatureVersion: 'v4',
    region: process.env.S3_REGION
});

var upload_pictures = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname
            });
        },
        key: function (req, file, cb) {
            cb(null, `pictures/${uuidv4()}${path.extname(file.originalname)}`);
        }
    })
});


module.exports = upload_pictures;
module.exports = s3;