const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const {
    S3
} = require("@aws-sdk/client-s3");

const s3 = new S3(
    {
        region: process.env.DEFAULT_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID ,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    }
);

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

PostSchema.pre('remove', async function () {
    if (process.env.STORAGE_TYPE === 's3') {
        const params ={
            Bucket: process.env.BUCKET_NAME,
            Key: post.key,
        }

        await s3.deleteObject(params).promise()
    } else {
        return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key ))
    }
})

module.exports = mongoose.model('Post', PostSchema)