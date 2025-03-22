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
        return  await blogCollection.findOne({ id });
    },

    async findBlogById(_id: ObjectId) {
        const blog =  await blogCollection.findOne({ _id })
        if (blog) {
            return {
                id: blog._id.toString(), // Convert ObjectId to string and rename to "id"
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            };
        } else {
            return null; // Return null if no blog is found
        }
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