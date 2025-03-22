import {db} from "../db/db";
import {BlogDBType, PostDBType} from "../input-output-types/types";
import {blogCollection, postCollection} from "../db/mongo-db";
import {ObjectId} from "mongodb";


export const postsRepository = {
    async findPosts(): Promise<PostDBType[]> {
        const posts =  await postCollection.find().toArray()
        return posts.map(post => ({
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
        }));
    },

    async createPost(title: string, shortDescription: string, content: string, blogId: string, blogName: string) {

        const newPost = {
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
            blogName: blogName,
            createdAt: new Date().toISOString(),
        }

        const res = await postCollection.insertOne(newPost);

        return res.insertedId;
    },

    async findPostById(_id: ObjectId) {
        const post = await postCollection.findOne({_id})
        if (post) {
            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
            };
        } else {
            return null; // Return null if no blog is found
        }
    },


    async updatePost(_id: ObjectId, title: string, shortDescription: string, content: string, blogId: string, blogName: string) {
        const res = await postCollection.updateOne(
            {_id},
            {
                $set: {
                    title: title,
                    shortDescription: shortDescription,
                    content: content,
                    blogId: blogId,
                    blogName: blogName,
                }
            }
        )
        return res.matchedCount === 1;
    },

    async deletePost(_id: ObjectId) {
        const result = await postCollection.deleteOne({_id});
        return result.deletedCount === 1

    }
}