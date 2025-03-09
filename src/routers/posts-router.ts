import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authMiddleware} from "../middlewares/auth-middleware";
import {HTTP_STATUSES} from "../utils";
import {postsRepository} from "../repositories/posts-repository";
import {postInputsValidation} from "../input-output-types/post-input-validations";

export const postsRouter = Router();



postsRouter.get("/", (req: Request, res: Response) => {
    const foundPosts = postsRepository.findPosts();
    res.send(foundPosts);
})

postsRouter.post(
    "/",
    authMiddleware,
    postInputsValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {

        const blog = blogsRepository.findBlogById(req.body.blogId)

        if (blog) {
            const newPost = postsRepository.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId, blog.name);
            res.status(HTTP_STATUSES.CREATED_201).json(newPost); // No explicit return
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400)
        }
    }
);


postsRouter.get("/:id", (req: Request, res: Response) => {
    let blog = postsRepository.findPostById(req.params.id);
    if (blog){
        res.send(blog);
    } else {
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})

postsRouter.delete("/:id", authMiddleware, (req: Request, res: Response) => {
    const isDeleted = postsRepository.deletePost(req.params.id);
    if (isDeleted) {
        res.send(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})


postsRouter.put("/:id", authMiddleware , postInputsValidation, inputValidationMiddleware, (req: Request, res: Response) => {
    const blog = blogsRepository.findBlogById(req.body.blogId)

    if (blog) {
        const isUpdated = postsRepository.updatePost(req.params.id, req.body.title, req.body.shortDescription, req.body.content, req.body.blogId, blog.name);
        if (isUpdated){
            res.send(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.send(HTTP_STATUSES.NOT_FOUND_404);
        }
    } else {
        res.status(HTTP_STATUSES.BAD_REQUEST_400)
    }





})