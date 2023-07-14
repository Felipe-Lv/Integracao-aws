const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multer')
const Post = require('./models/Post')
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



routes.get('/posts', async (req, res) => {
    const posts = await Post.find()

    return res.json(posts)
})


routes.post('/posts', multer(multerConfig).single('file'), async (req, res) => {
    const {originalname: name, size, key, location: url = ''} = req.file

    const post = await Post.create({
        name,
        size,
        key,
        url,
    })
    return res.json(post)
})

routes.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) return res.status(400).send({error: 'Post not found'})
        
        console.log('post: ', post)

        const params ={
            Bucket: process.env.BUCKET_NAME,
            Key: post.key,
        }

        await s3.deleteObject(params)
        .then(async response => {
         await Post.findByIdAndDelete(post._id)
         res.send({message: 'Post deleted'})
         return response

        })
        .catch(response => {
            res.send({message: 'Post not deleted'})
            return response
        });
    
    
       
        
    } catch (err) {
        console.log(err)
        return res.status(400).send({error: 'Error deleting post'})
    }
   
})

module.exports = routes