import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {HTTP_STATUSES} from "../utils";

export const objectIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if(!ObjectId.isValid(req.params.id)){
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return
    }

    next();
}