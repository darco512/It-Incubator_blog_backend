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
import {commentsQueriesRepository} from "../repositories/comments-queries-repository";
import {commentInputsValidation} from "../input-output-types/comment-input-validator";
import {postsRepository} from "../repositories/posts-repository";
import {commentsService} from "../domain/comments-service";
import {baseAuthMiddleware} from "../middlewares/base-auth-middleware";

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
    baseAuthMiddleware,
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
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})

postsRouter.delete("/:id", baseAuthMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await postsService.deletePost(new ObjectId(req.params.id));
    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})

postsRouter.put("/:id", baseAuthMiddleware , postInputsValidation, inputValidationMiddleware,  objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const blog = await blogsService.findBlogById(new ObjectId(req.body.blogId))

    if (blog) {
        const isUpdated = await postsService.updatePost(new ObjectId(req.params.id), req.body.title, req.body.shortDescription, req.body.content, req.body.blogId, blog.name);
        if (isUpdated){
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    } else {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    }
})

postsRouter.get("/:id/comments", async (req: Request, res: Response) => {
    const {pageNumber, pageSize, sortBy, sortDirection, postId} = paginationQueries(req)

    const foundComments = await commentsQueriesRepository.findComments({pageNumber, pageSize, sortBy, sortDirection, postId});
    const commentsCounts  = await commentsQueriesRepository.getCommentsCount(postId)
    const result = commentsQueriesRepository.mapPaginationViewModel({commentsCounts, foundComments, pageSize, pageNumber})
    res.status(HTTP_STATUSES.OK_200).json(result)
})

postsRouter.post("/:id/comments",
    authMiddleware,
    commentInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const post = await postsService.findPostById(new ObjectId(req.params.id));

        if (post) {
            const newCommentId = await commentsService.createComment(new ObjectId(req.params.id), req.body, req.user!);
            const newComment = await commentsService.findComment(newCommentId);
            res.status(HTTP_STATUSES.CREATED_201).send(newComment);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

