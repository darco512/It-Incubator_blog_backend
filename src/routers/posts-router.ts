import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authMiddleware} from "../middlewares/auth-middleware";
import {HTTP_STATUSES} from "../utils";
import {postsService} from "../domain/posts-service";
import {postInputsValidation} from "../input-output-types/post-input-validations";
import {objectIdValidationMiddleware} from "../middlewares/ObjectId-validation-middleware";
import {ObjectId} from "mongodb";
import {blogsService} from "../domain/blogs-service";
import {paginationQueries} from "../helpers/paginations-values";
import {postsQueriesRepository} from "../repositories/posts-queries-repository";

export const postsRouter = Router();



postsRouter.get("/",async (req: Request, res: Response) => {

    const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId} = paginationQueries(req)

    const foundPosts = await postsQueriesRepository.findPosts({pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, blogId});
    const postsCounts  = await postsQueriesRepository.getPostsCount(searchNameTerm, blogId)
    const result = postsQueriesRepository.mapPaginationViewModel({postsCounts, foundPosts, pageSize, pageNumber})
    res.status(HTTP_STATUSES.OK_200).json(result)
})

postsRouter.post(
    "/",
    authMiddleware,
    postInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {


        const blog = await blogsRepository.findBlogById(new ObjectId(req.body.blogId));

        if (blog) {
            const newPostId = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId, blog.name);
            const newPost = await postsService.findPostById(newPostId);
            res.status(HTTP_STATUSES.CREATED_201).json(newPost); // No explicit return
        } else {
            res.status(HTTP_STATUSES.NOT_FOUND_404)
        }
    }
);


postsRouter.get("/:id", objectIdValidationMiddleware, async (req: Request, res: Response) => {
    let blog = await postsService.findPostById(new ObjectId(req.params.id));
    if (blog){
        res.send(blog);
    } else {
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})

postsRouter.delete("/:id", authMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await postsService.deletePost(new ObjectId(req.params.id));
    if (isDeleted) {
        res.send(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})


postsRouter.put("/:id", authMiddleware , postInputsValidation, inputValidationMiddleware,  objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const blog = await blogsService.findBlogById(new ObjectId(req.body.blogId))

    if (blog) {
        const isUpdated = await postsService.updatePost(new ObjectId(req.params.id), req.body.title, req.body.shortDescription, req.body.content, req.body.blogId, blog.name);
        if (isUpdated){
            res.send(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.send(HTTP_STATUSES.NOT_FOUND_404);
        }
    } else {
        res.send(HTTP_STATUSES.BAD_REQUEST_400)
    }





})