import {blogCollection} from "../db/mongo-db";
import {BlogDBInputType, BlogDBType, InputBlogType, OutputBlogType} from "../input-output-types/types";
import {ObjectId, SortDirection, WithId} from "mongodb";



export const blogsRepository = {
    async findBlogs() : Promise<BlogDBType[]> {
        return await blogCollection.find().toArray()
    },


    async createBlog(newBlog: BlogDBInputType) {

        const res = await blogCollection.insertOne(newBlog as BlogDBType);

        return res.insertedId;
    },

    async findBlog(id: string) {
        return  await blogCollection.findOne({ id });
    },

    async findBlogById(_id: ObjectId) {
        return await blogCollection.findOne({ _id })
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