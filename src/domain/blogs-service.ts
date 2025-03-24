
import {BlogDBType, BlogType, InputBlogType} from "../input-output-types/types";
import {ObjectId, SortDirection} from "mongodb";
import {blogsRepository} from "../repositories/blogs-repository";



export const blogsService = {
    async findBlogs(    ) : Promise<BlogType[]> {
        const blogs =  await blogsRepository.findBlogs()
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

        return  await blogsRepository.createBlog(newBlog);

    },

    async findBlog(id: string) {
        return  await blogsRepository.findBlog(id);
    },

    async findBlogById(_id: ObjectId) {
        const blog =  await blogsRepository.findBlogById(_id)
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
        return await blogsRepository.updateBlog(_id, body)
    },

    async deleteBlog(_id: ObjectId) {
        return await blogsRepository.deleteBlog(_id);
    }

}