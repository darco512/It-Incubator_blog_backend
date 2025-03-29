import {body} from "express-validator";

export const loginOrEmailValidation = body("loginOrEmail")
    .isString()
    .withMessage("Name should be string")

export const passwordValidation = body("password")
    .isString()
    .withMessage("Description should be a string")



export const authInputsValidation = [
    loginOrEmailValidation,
    passwordValidation,
]

