import {body} from "express-validator";

export const loginOrEmailValidation = body("loginOrEmail")
    .isString()
    .withMessage("loginOrEmail should be string")

export const passwordValidation = body("password")
    .isString()
    .withMessage("password should be a string")



export const authInputsValidation = [
    loginOrEmailValidation,
    passwordValidation,
]

