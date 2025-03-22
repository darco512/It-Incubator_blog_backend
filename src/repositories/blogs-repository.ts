import {blogCollection} from "../db/mongo-db";
import {BlogDBType, InputBlogType} from "../input-output-types/types";
import {ObjectId} from "mongodb";



export const blogsRepository = {
    async findBlogs() : Promise<BlogDBType[]> {
        return blogCollection.find().toArray()
    },

    async createBlog(body: InputBlogType) {
        const newBlog = {
            id: String(Date.now() + Math.random()),
            name: body.name,
            description: body.description,
            websiteUrl: body.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        }

        const res = await blogCollection.insertOne(newBlog);

        return res.insertedId;
    },

    async findBlog(id: string) {
        return await blogCollection.findOne({ id });
    },

    async findBlogById(_id: ObjectId) {
        return await blogCollection.findOne({ _id });
    },


    async updateBlog(id: string, body: InputBlogType) {
        const res = await blogCollection.updateOne(
            { id },
            { $set: { ...body } }
        )
        return res.matchedCount === 1;
    },

    async deleteBlog(id: string) {
        const result = await blogCollection.deleteOne({id});
        return result.deletedCount === 1
    }

 }