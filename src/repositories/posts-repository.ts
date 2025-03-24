import {UpdatePostType, PostDBType} from "../input-output-types/types";
import { postCollection} from "../db/mongo-db";
import {ObjectId} from "mongodb";


export const postsRepository = {
    async findPosts(): Promise<PostDBType[]> {
        return await postCollection.find().toArray()
    },

    async createPost(newPost: any) {

        const res = await postCollection.insertOne(newPost);

        return res.insertedId;
    },

    async findPostById(_id: ObjectId) {
        return await postCollection.findOne({_id})
    },


    async updatePost(_id: ObjectId, updatedPost: UpdatePostType) {
        const res = await postCollection.updateOne(
            { _id },
            {$set: {...updatedPost}}
        )
        return res.matchedCount === 1;
    },

    async deletePost(_id: ObjectId) {
        const result = await postCollection.deleteOne({_id});
        return result.deletedCount === 1

    }
}