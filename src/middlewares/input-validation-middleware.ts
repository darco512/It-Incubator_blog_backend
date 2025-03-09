import {Request, Response, NextFunction} from "express";
import {FieldValidationError, validationResult, ValidationError} from "express-validator";
import {ValidationErrorsType} from "../input-output-types/validation-errors-type";


const formatErrors = (error: ValidationError) :ValidationErrorsType => {
    const expressError = error as unknown as FieldValidationError;

    return {
        message: expressError.msg,
        field: expressError.path,
    }
}

export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
        .formatWith(formatErrors)
        .array({onlyFirstError: true});


    if (!errors.length) {
        next();
        return;
    } else {
        res.status(400).json({ errorsMessages: errors});
        return;
    }
}