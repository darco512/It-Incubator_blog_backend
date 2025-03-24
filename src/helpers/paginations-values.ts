import { Request } from "express";
import {SortDirection} from "mongodb";

export const paginationQueries = (req: Request) => {
    let pageNumber: number = req.query.pageNumber ? +req.query.pageNumber : 1;
    let pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;
    let sortBy: string = req.query.sortBy ? req.query.sortBy.toString() : 'createdAt';
    let sortDirection :SortDirection = req.query.sortDirection && req.query.sortDirection === 'asc' ? 'asc' : 'desc';
    let searchNameTerm: string | null = req.query.searchNameTerm ? req.query.searchNameTerm.toString() : null;
    let blogId: string | null = req.params.id ? req.params.id : null;



    return {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId}
}