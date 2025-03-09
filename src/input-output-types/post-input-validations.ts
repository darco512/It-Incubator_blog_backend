import {body} from "express-validator";
import {db} from '../db/db'

export const titleValidation = body("title")
    .isString()
    .withMessage("Title should be string")
    .trim()
    .isLength({min: 3, max: 30 })
    .withMessage("Title length shouldn't be less then 3 and exceed 30 symbols")

export const shortDescriptionValidation = body("shortDescription")
    .isString()
    .withMessage("Short description should be a text")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Short description is to small or to long, it can't be less than 5 or more than 100 symbols")

export const contentValidation = body("content")
    .isString()
    .withMessage("Content should be a string")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Content is to small or to long long, it can't be less than 5 or more than 1000 symbols")


export const blogIDValidation = body("blogId")
    .isString()
    .withMessage("Blog ID should be a string")
    .custom( id => {
        return db.blogs.find((x) => x.id === id)
    })
    .withMessage("Blog with such id doesn't exist")

export const postInputsValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIDValidation
]

