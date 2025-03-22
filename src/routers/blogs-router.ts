import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authMiddleware} from "../middlewares/auth-middleware";
import {blogInputsValidation} from "../input-output-types/blog-input-validations";
import {HTTP_STATUSES} from "../utils";
import {objectIdValidationMiddleware} from "../middlewares/ObjectId-validation-middleware";
import {ObjectId} from "mongodb";

export const blogsRouter = Router();



blogsRouter.get("/", async (req: Request, res: Response) => {
    const foundBlogs = await blogsRepository.findBlogs();
    res.status(HTTP_STATUSES.OK_200).json(foundBlogs)
})

blogsRouter.post(
    "/",
    authMiddleware,
    blogInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const newBlogId = await blogsRepository.createBlog(req.body);
        const newBlog = await blogsRepository.findBlogById(newBlogId);
        res.status(HTTP_STATUSES.CREATED_201).json(newBlog); // No explicit return
    }
);


blogsRouter.get("/:id", async (req: Request, res: Response) => {

    let blog = await blogsRepository.findBlog(req.params.id);
    if (blog){
        res.send(blog);
    } else {
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})

blogsRouter.delete("/:id", authMiddleware , async (req: Request, res: Response) => {
    const isDeleted = await blogsRepository.deleteBlog(req.params.id);
    if (isDeleted) {
        res.send(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})


blogsRouter.put("/:id", authMiddleware , blogInputsValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const isUpdated = await blogsRepository.updateBlog(req.params.id, req.body);
    if (isUpdated){
        res.send(HTTP_STATUSES.NO_CONTENT_204);
    } else {
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})