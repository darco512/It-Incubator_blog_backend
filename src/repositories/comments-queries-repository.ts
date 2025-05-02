import {postCollection} from "../db/mongo-db";
import {CommentDBType} from "../input-output-types/types";
import {ObjectId, SortDirection} from "mongodb";



export const commentsQueriesRepository = {
    async findComments(dto: {
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        postId: string
    }): Promise<CommentDBType[]> {

        const {pageNumber, pageSize, sortBy, sortDirection, postId} = dto;

        const postComments = await postCollection
            .aggregate([
                { $match: { _id: new ObjectId(postId) } },
                { $project: { comments: 1 } },
                { $unwind: "$comments" },
                { $sort: { [`comments.${sortBy}`]: sortDirection === 'asc' ? 1 : -1 } },
                { $skip: (pageNumber - 1) * pageSize },
                { $limit: pageSize },
                { $group: {
                        _id: "$_id",
                        comments: { $push: "$comments" }
                    }}
            ])
            .toArray();

        return postComments[0].comments || []
    },

    async getCommentsCount(postId: string): Promise<number> {
        const filter: any[] = [
            { $match: { _id: new ObjectId(postId) } },
            { $project: {
                    count: {
                        $size: {
                            $ifNull: ["$comments", []]
                        }
                    }
                }}
        ];

        const result = await postCollection.aggregate(filter).toArray();
        return result[0]?.count || 0
    },

    mapBlogToViewModel(comment: CommentDBType) {
        return {
            id: comment._id.toString(), // Convert ObjectId to string and rename to "id"
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt,
        }
    },

    mapPaginationViewModel(dto: {
        commentsCounts: number,
        foundComments: CommentDBType[],
        pageSize: number,
        pageNumber: number
    }) {
        return {
            pagesCount: Math.ceil(dto.commentsCounts / dto.pageSize),
            page: dto.pageNumber,
            pageSize: dto.pageSize,
            totalCount: dto.commentsCounts,
            items: dto.foundComments.map(this.mapBlogToViewModel)
        }
    }
}