const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const {
    S3
} = require("@aws-sdk/client-s3")

const s3 = new S3(
    {
        region: process.env.REGION,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        }
    }
)

const PostSchema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

PostSchema.pre('save', function () {
    if (!this.url) {
        this.url = `${process.env.APP_URL}/files/${this.key}`
    }
})

module.exports = mongoose.model('Post', PostSchema)