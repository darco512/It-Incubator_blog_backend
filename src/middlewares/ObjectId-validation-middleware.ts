import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";

export const objectIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if(!ObjectId.isValid(req.params.id)){
        res.status(400);
        return
    }

    next();
}