import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authMiddleware} from "../middlewares/auth-middleware";
import {HTTP_STATUSES} from "../utils";
import {objectIdValidationMiddleware} from "../middlewares/ObjectId-validation-middleware";
import {ObjectId} from "mongodb";
import {commentsService} from "../domain/comments-service";
import {commentInputsValidation} from "../input-output-types/comment-input-validator";

export const commentsRouter = Router();

commentsRouter.get("/:id", objectIdValidationMiddleware, async (req: Request, res: Response) => {

    let comment = await commentsService.findComment(new ObjectId(req.params.id));
    if (comment){
        res.status(HTTP_STATUSES.OK_200).send(comment);
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})

commentsRouter.put("/:id", authMiddleware , commentInputsValidation, inputValidationMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {

    const comment = await commentsService.findComment(new ObjectId(req.params.id))
    if (comment?.commentatorInfo.userId !== req.user?._id.toString()){
        res.sendStatus(403);
    }
    const isUpdated = await commentsService.updateComment(new ObjectId(req.params.id), req.body);
    if (isUpdated){
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})


commentsRouter.delete("/:id", authMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await commentsService.deleteComment(new ObjectId(req.params.id));
    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})
