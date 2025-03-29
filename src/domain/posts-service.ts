
import {PostDBType, PostType, UpdatePostType} from "../input-output-types/types";
import {ObjectId} from "mongodb";
import {postsRepository} from "../repositories/posts-repository";


export const postsService = {
    async findPosts(): Promise<PostType[]> {
        const posts =  await postsRepository.findPosts()
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

       return postsRepository.createPost(newPost);
    },

    async findPostById(_id: ObjectId) {
        const post = await postsRepository.findPostById(_id)
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
        const updatedPost: UpdatePostType =  {
                title: title,
                shortDescription: shortDescription,
                content: content,
                blogId: blogId,
                blogName: blogName,
            }
        return  await postsRepository.updatePost(_id, updatedPost);
    },

    async deletePost(_id: ObjectId) {
        return  await postsRepository.deletePost(_id);
    }
}