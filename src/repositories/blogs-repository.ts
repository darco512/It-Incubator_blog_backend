import {blogCollection} from "../db/mongo-db";
import {BlogDBType, InputBlogType} from "../input-output-types/types";
import {ObjectId} from "mongodb";



export const blogsRepository = {
    async findBlogs() : Promise<BlogDBType[]> {
        const blogs =  await blogCollection.find().toArray()
        return blogs.map(blog => ({
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
        }));
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

    async findBlog(id: string) {
        const blog =  await blogCollection.findOne({ id });
    },

    async findBlogById(_id: ObjectId) {
        const blogs =  await blogCollection.find().toArray()
        return blogs.map(blog => ({
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
        }));
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