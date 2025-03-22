import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authMiddleware} from "../middlewares/auth-middleware";
import {HTTP_STATUSES} from "../utils";
import {postsRepository} from "../repositories/posts-repository";
import {postInputsValidation} from "../input-output-types/post-input-validations";
import {objectIdValidationMiddleware} from "../middlewares/ObjectId-validation-middleware";
import {ObjectId} from "mongodb";

export const postsRouter = Router();



postsRouter.get("/",async (req: Request, res: Response) => {
    const foundPosts = await postsRepository.findPosts();
    res.send(foundPosts);
})

postsRouter.post(
    "/",
    authMiddleware,
    postInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {


        const blog = await blogsRepository.findBlogById(new ObjectId(req.body.blogId));

        if (blog) {
            const newPost = await postsRepository.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId, blog.name);
            res.status(HTTP_STATUSES.CREATED_201).json(newPost); // No explicit return
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400)
        }
    }
);


postsRouter.get("/:id", objectIdValidationMiddleware, async (req: Request, res: Response) => {
    let blog = await postsRepository.findPostById(new ObjectId(req.params.id));
    if (blog){
        res.send(blog);
    } else {
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})

postsRouter.delete("/:id", authMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await postsRepository.deletePost(new ObjectId(req.params.id));
    if (isDeleted) {
        res.send(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})


postsRouter.put("/:id", authMiddleware , postInputsValidation, inputValidationMiddleware,  objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const blog = await blogsRepository.findBlogById(new ObjectId(req.body.blogId))

    if (blog) {
        const isUpdated = await postsRepository.updatePost(new ObjectId(req.params.id), req.body.title, req.body.shortDescription, req.body.content, req.body.blogId, blog.name);
        if (isUpdated){
            res.send(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.send(HTTP_STATUSES.NOT_FOUND_404);
        }
    } else {
        res.send(HTTP_STATUSES.BAD_REQUEST_400)
    }





})