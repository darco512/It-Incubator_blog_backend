import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authMiddleware} from "../middlewares/auth-middleware";
import {blogInputsValidation} from "../input-output-types/blog-input-validations";
import {HTTP_STATUSES} from "../utils";

export const blogsRouter = Router();



blogsRouter.get("/", (req: Request, res: Response) => {
    const foundProducts = blogsRepository.findBlogs();
    res.send(foundProducts);
})

blogsRouter.post(
    "/",
    authMiddleware,
    blogInputsValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {
        const newBlog = blogsRepository.createBlog(req.body.name, req.body.description, req.body.websiteUrl);
        res.status(HTTP_STATUSES.CREATED_201).json(newBlog); // No explicit return
    }
);


blogsRouter.get("/:id", (req: Request, res: Response) => {
    let blog = blogsRepository.findBlogById(req.params.id);
    if (blog){
        res.send(blog);
    } else {
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})

blogsRouter.delete("/:id", authMiddleware, (req: Request, res: Response) => {
    const isDeleted = blogsRepository.deleteBlog(req.params.id);
    if (isDeleted) {
        res.send(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})


blogsRouter.put("/:id", authMiddleware , blogInputsValidation, inputValidationMiddleware, (req: Request, res: Response) => {

    const isUpdated = blogsRepository.updateBlog(req.params.id, req.body.name, req.body.description, req.body.websiteUrl);
    if (isUpdated){
        const product = blogsRepository.findBlogById(req.params.id);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204).send(product);
    } else {
        res.send(HTTP_STATUSES.NOT_FOUND_404);
    }
})