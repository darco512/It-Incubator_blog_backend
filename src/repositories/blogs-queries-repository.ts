import {blogCollection} from "../db/mongo-db";
import {BlogDBType} from "../input-output-types/types";
import {SortDirection} from "mongodb";



export const blogsQueriesRepository = {
    async findBlogs(dto: {
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        searchNameTerm: string | null
    }): Promise<BlogDBType[]> {

        const filter: any = {}
        const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm} = dto;
        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: 'i'};
        }

        return await blogCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },

    async getBlogsCount(searchNameTerm: string | null): Promise<number> {
        const filter: any = {}
        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: 'i'};
        }
        return blogCollection.countDocuments(filter)
    },

    mapBlogToViewModel(blog: BlogDBType) {
        return {
            id: blog._id.toString(), // Convert ObjectId to string and rename to "id"
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
        }
    },

    mapPaginationViewModel(dto: {
        blogsCounts: number,
        foundBlogs: BlogDBType[],
        pageSize: number,
        pageNumber: number
    }) {
        return {
            pagesCount: Math.ceil(dto.blogsCounts / dto.pageSize),
            page: dto.pageNumber,
            pageSize: dto.pageSize,
            totalCount: dto.blogsCounts,
            items: dto.foundBlogs.map(this.mapBlogToViewModel)
        }
    }
}