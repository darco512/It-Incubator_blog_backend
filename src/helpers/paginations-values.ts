import { Request } from "express";
import {SortDirection} from "mongodb";
import {postsQueriesRepository} from "../repositories/posts-queries-repository";
import {HTTP_STATUSES} from "../utils";

export const paginationQueries = (req: Request) => {
    let pageNumber: number = req.query.pageNumber ? +req.query.pageNumber : 1;
    let pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;
    let sortBy: string = req.query.sortBy ? req.query.sortBy.toString() : 'createdAt';
    let sortDirection :SortDirection = req.query.sortDirection && req.query.sortDirection === 'asc' ? 'asc' : 'desc';
    let searchNameTerm: string | null = req.query.searchNameTerm ? req.query.searchNameTerm.toString() : null;
    let blogId: string | null = req.params.id ? req.params.id : null;
    let searchEmailTerm: string | null = req.query.searchEmailTerm ? req.query.searchEmailTerm.toString() : null;
    let searchLoginTerm: string | null = req.query.searchLoginTerm ? req.query.searchLoginTerm.toString() : null;
    let postId: string = req.params.id;



    return {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId, searchEmailTerm, searchLoginTerm, postId}
}

// export const async paginatonRequest = (req: Request, res: Response) => {
//
//     const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId} = paginationQueries(req)
//
//     const foundPosts = await postsQueriesRepository.findPosts({pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId});
//     const postsCounts  = await postsQueriesRepository.getPostsCount(searchNameTerm, blogId)
//     const result = postsQueriesRepository.mapPaginationViewModel({postsCounts, foundPosts, pageSize, pageNumber})
//     return res.status(HTTP_STATUSES.OK_200).json(result)
// }