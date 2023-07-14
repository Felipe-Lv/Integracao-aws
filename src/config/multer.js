const multer = require("multer")
const path = require("path")
const crypto = require("crypto")
const {
    S3
} = require("@aws-sdk/client-s3")
const multerS3 = require('multer-s3')
const s3 = new S3({
    apiVersion: process.env.API_VERSION,
    region: process.env.DEFAULT_REGION,
    credential: {
        acessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAcessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const BucketRotas = 'diagnosticoProdutivo/'
const BucketRotas2 = 'user2/'

const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"))
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err)

                file.key = `${hash.toString('hex')}-${file.originalname}`

                cb(null, file.key)
            })
        }
    }),
    s3: multerS3({
        s3: s3,
        bucket: process.env.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err)

                const fileName = `${BucketRotas}${BucketRotas2}${hash.toString('hex')}-${file.originalname}`

                cb(null, fileName)
            })
        }
    })
}

module.exports = {
    dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
    storage: storageTypes[process.env.STORAGE_TYPES],
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb ) => {
        const allowedMimes = [
            "image/jpeg",
            "image/pjeg",
            "image/png",
            "image/gif",
        ]

        if(allowedMimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file type.'))
        }
    },
}