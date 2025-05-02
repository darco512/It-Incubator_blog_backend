import {body} from "express-validator";

export const contentValidation = body("content")
    .isString()
    .withMessage("content should be string")
    .trim()
    .isLength( {min:20, max: 300 })
    .withMessage("Comment length shouldn't be less than 20 and exceed 300 symbols")



export const commentInputsValidation = [
    contentValidation
]

