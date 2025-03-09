import {body} from "express-validator";

export const nameValidation = body("name")
    .isString()
    .withMessage("Name should be string")
    .trim()
    .isLength( {min:3, max: 15 })
    .withMessage("Name length shouldn't be less than 3 and exceed 15 symbols")

export const descriptionValidation = body("description")
    .isString()
    .withMessage("Description should be a text")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Wrong description size, it can't be less than 1 and more than 500 symbols")

export const websiteURLValidation = body("websiteUrl")
    .isString()
    .withMessage("URL should be a string")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("URL is to short or to long, it can't be empty or more than 100 symbols")
    .custom(value => {
        const pattern = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;
        return value.match(pattern);
    })
    .withMessage("Wrong URL format.")


export const blogInputsValidation = [
    nameValidation,
    descriptionValidation,
    websiteURLValidation,
]

