import {blogCollection} from "../db/mongo-db";
import {BlogDBType, InputBlogType} from "../input-output-types/types";
import {ObjectId} from "mongodb";



export const blogsRepository = {
    async findBlogs() : Promise<BlogDBType[]> {
        return blogCollection.find().toArray()
    },

    async createBlog(body: InputBlogType) {
        const newBlog = {
            name: body.name,
            description: body.description,
            websiteUrl: body.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        }

        const res = await blogCollection.insertOne(newBlog);

        return res.insertedId;
    },

    async findBlog(_id: ObjectId) {
        return await blogCollection.findOne({ _id });
    },

    async findBlogById(_id: ObjectId) {
        return await blogCollection.findOne({ _id });
    },


    async updateBlog(_id: ObjectId, body: InputBlogType) {
        const res = await blogCollection.updateOne(
            { _id },
            { $set: { ...body } }
        )
        return res.matchedCount === 1;
    },

    async deleteBlog(_id: ObjectId) {
        const result = await blogCollection.deleteOne({_id});
        return result.deletedCount === 1
    }

 }