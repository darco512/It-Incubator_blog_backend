import {db} from "../db/db";
import {BlogDBType, PostDBType} from "../input-output-types/types";
import {blogCollection, postCollection} from "../db/mongo-db";
import {ObjectId} from "mongodb";


export const postsRepository = {
    async findPosts(): Promise<PostDBType[]> {
        return postCollection.find().toArray()
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
        return await postCollection.findOne({_id});
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