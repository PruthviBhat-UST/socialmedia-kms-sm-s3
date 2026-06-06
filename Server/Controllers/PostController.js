import postModel from '../Models/postModel.js';
import mongoose from 'mongoose';
import UserModel from "../Models/userModel.js";
import { generatePresignedUrl, extractS3Key } from '../utils/s3Helpers.js';

// Create new post
// Create new post
export const createPost = async (req, res) => {
    const newPost = new postModel(req.body);

    try {
        await newPost.save();
        const postObj = newPost.toObject();
        
        if (postObj.image) {
            const key = extractS3Key(postObj.image);
            if (key) {
                postObj.image = await generatePresignedUrl(key, 3600);
            }
        }
        
        res.status(200).json(postObj)
    } catch (error) {
        res.status(500).json(error)
    }
}
// get a post
export const getPost = async (req, res) => {
    const id = req.params.id

    try {
        const post = await postModel.findById(id)
        const postObj = post.toObject();
        
        if (postObj.image) {
            const key = extractS3Key(postObj.image);
            if (key) {
                postObj.image = await generatePresignedUrl(key, 3600);
            }
        }
        
        res.status(200).json(postObj)
    } catch (error) {
        res.status(500).json(error)
    }
}

//update a Post
export const updatePost = async (req, res) => {
    const postId = req.params.id

    const { userId } = req.body

    try {
        const post = await postModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post Updated Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}



// delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;

    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (post.userId === userId) {
            await post.deleteOne();
            res.status(200).json("Post deleted Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}


// Like/Dislike a Post

export const like_dislike_Post = async (req, res) => {
    const id = req.params.id;

    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("Post liked.")
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post unliked.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


// Get timeline a Posts

// Get timeline a Posts
export const timeline = async (req, res) => {
    const userId = req.params.id;

    try {
        const currenUserPosts = await postModel.find({ userId: userId });
        const followingUserPosts = await UserModel.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "following",
                        foreignField: "userId",
                        as: "followingUserPosts"
                    }
                },
                {
                    $project: {
                        followingUserPosts: 1,
                        _id: 0
                    }
                }
            ]
        )

        let allPosts = currenUserPosts.concat(...followingUserPosts[0].followingUserPosts).sort((a, b) => {
            return b.createdAt - a.createdAt;
        });
        
        // Generate pre-signed URLs for each post that has an image
        const postsWithUrls = await Promise.all(allPosts.map(async (post) => {
            const postObj = post.toObject ? post.toObject() : post;
            if (postObj.image) {
                const key = extractS3Key(postObj.image);
                if (key) {
                    postObj.image = await generatePresignedUrl(key, 3600); // 1 hour expiry
                }
            }
            return postObj;
        }));
        
        res.status(200).json(postsWithUrls);

    } catch (error) {
        console.error("Timeline error:", error);
        res.status(500).json(error);
    }
}
