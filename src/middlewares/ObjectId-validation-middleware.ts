import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {HTTP_STATUSES} from "../utils";

export const objectIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if(!id || !ObjectId.isValid(id)){
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return
    }

    next();
}