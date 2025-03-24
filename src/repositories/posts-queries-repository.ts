import {blogCollection, postCollection} from "../db/mongo-db";
import {BlogDBType, PostDBType} from "../input-output-types/types";
import {SortDirection} from "mongodb";



export const postsQueriesRepository = {
    async findPosts(dto: {
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        searchNameTerm: string | null
        blogId: string | null
    }): Promise<PostDBType[]> {

        const filter: any = {}
        const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId} = dto;
        if (searchNameTerm) {
            filter.title = {$regex: searchNameTerm, $options: 'i'};
        }
        if (blogId) {
            filter.blogId = {$regex: blogId, $options: 'i'};
        }

        return await postCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },

    async getPostsCount(searchNameTerm: string | null, blogId: string | null): Promise<number> {
        const filter: any = {}
        if (searchNameTerm) {
            filter.title = {$regex: searchNameTerm, $options: 'i'};
        }
        if (blogId) {
            filter.blogId = {$regex: blogId, $options: 'i'};
        }
        return postCollection.countDocuments(filter)
    },

    mapPostToViewModel(post: PostDBType) {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
        }
    },

    mapPaginationViewModel(dto: {
        postsCounts: number,
        foundPosts: PostDBType[],
        pageSize: number,
        pageNumber: number
    }) {
        return {
            pagesCount: Math.ceil(dto.postsCounts / dto.pageSize),
            page: dto.pageNumber,
            pageSize: dto.pageSize,
            totalCount: dto.postsCounts,
            items: dto.foundPosts.map(this.mapPostToViewModel)
        }
    }
}