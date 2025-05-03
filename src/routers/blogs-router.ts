import {Request, Response, Router} from "express";
import {blogsService} from "../domain/blogs-service";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authMiddleware} from "../middlewares/auth-middleware";
import {blogInputsValidation} from "../input-output-types/blog-input-validations";
import {HTTP_STATUSES} from "../utils";
import {objectIdValidationMiddleware} from "../middlewares/ObjectId-validation-middleware";
import {ObjectId, SortDirection} from "mongodb";
import {paginationQueries} from "../helpers/paginations-values";
import {blogsQueriesRepository} from "../repositories/blogs-queries-repository";
import {postsQueriesRepository} from "../repositories/posts-queries-repository";
import {postInputsValidation} from "../input-output-types/post-input-validations";
import {blogsRepository} from "../repositories/blogs-repository";
import {postsService} from "../domain/posts-service";
import {baseAuthMiddleware} from "../middlewares/base-auth-middleware";

export const blogsRouter = Router();



blogsRouter.get("/", async (req: Request, res: Response) => {

    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1;
    let pageSize = req.query.pageSize ? +req.query.pageSize : 10;
    let sortBy = req.query.sortBy ? req.query.sortBy.toString() : "createdAt";
    let sortDirection :SortDirection = req.query.sortDirection && req.query.sortDirection === 'asc' ? 'asc' : 'desc';
    let searchNameTerm = req.query.searchNameTerm ? req.query.searchNameTerm.toString() : null;

    // const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId} = paginationQueries(req)

    const foundBlogs = await blogsQueriesRepository.findBlogs({pageNumber, pageSize, sortBy, sortDirection, searchNameTerm});
    const blogsCounts  = await blogsQueriesRepository.getBlogsCount(searchNameTerm)
    const result = blogsQueriesRepository.mapPaginationViewModel({blogsCounts, foundBlogs, pageSize, pageNumber})
    res.status(HTTP_STATUSES.OK_200).json(result)

    // const fountBlogs = await blogsService.findBlogs()
    // res.status(HTTP_STATUSES.OK_200).json(fountBlogs)
})

blogsRouter.get("/:id", objectIdValidationMiddleware, async (req: Request, res: Response) => {

    let blog = await blogsService.findBlogById(new ObjectId(req.params.id));
    if (blog){
        res.send(blog);
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})

blogsRouter.get("/:id/posts", async (req: Request, res: Response) => {
    const blog = await blogsService.findBlogById(new ObjectId(req.params.id));
    if (blog) {
        const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId} = paginationQueries(req)

        const foundPosts = await postsQueriesRepository.findPosts({pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId});
        const postsCounts  = await postsQueriesRepository.getPostsCount(searchNameTerm, blogId)
        const result = postsQueriesRepository.mapPaginationViewModel({postsCounts, foundPosts, pageSize, pageNumber})
        res.status(HTTP_STATUSES.OK_200).json(result)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

})


blogsRouter.post(
    "/",
    baseAuthMiddleware,
    blogInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        debugger;
        const newBlogId = await blogsService.createBlog(req.body);
        const newBlog = await blogsService.findBlogById(newBlogId);
        res.status(HTTP_STATUSES.CREATED_201).json(newBlog); // No explicit return
    }
);


blogsRouter.post(
    "/:id/posts",
    baseAuthMiddleware,
    postInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const blog = await blogsRepository.findBlogById(new ObjectId(req.params.id));

        if (blog) {
            const newPostId = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.id, blog.name);
            const newPost = await postsService.findPostById(newPostId);
            res.status(HTTP_STATUSES.CREATED_201).json(newPost); // No explicit return
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    }
);

blogsRouter.put("/:id", baseAuthMiddleware , blogInputsValidation, inputValidationMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const isUpdated = await blogsService.updateBlog(new ObjectId(req.params.id), req.body);
    if (isUpdated){
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})


blogsRouter.delete("/:id", baseAuthMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await blogsService.deleteBlog(new ObjectId(req.params.id));
    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})
