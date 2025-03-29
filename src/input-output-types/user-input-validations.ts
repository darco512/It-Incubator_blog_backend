import {body} from "express-validator";
import {userCollection} from "../db/mongo-db";


export const loginValidation = body("login")
    .isString()
    .withMessage("Name should be string")
    .trim()
    .isLength( {min:3, max: 10 })
    .withMessage("Name length shouldn't be less than 3 and exceed 15 symbols")
    .custom(value => {
        const pattern = /^[a-zA-Z0-9_-]*$/;
        return value.match(pattern);
    })
    .withMessage("Login can only contain letters (A-Z, a-z), numbers (0-9), underscores (_), or hyphens (-).")
    // .custom(async value => {
    //     const user = await userCollection.findOne({login: value})
    //     if (user) {
    //         throw new Error();
    //     }
    // })
    // .withMessage("Login must be unique!")

export const passwordValidation = body("password")
    .isString()
    .withMessage("Password should be a string")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("Wrong description size, it can't be less than 6 and more than 20 symbols")

export const emailValidation = body("email")
    .isString()
    .withMessage("email should be a string")
    .trim()
    .custom(value => {
        const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return value.match(pattern);
    })
    .withMessage("Wrong email format.")
    // .custom(async value => {
    //     const user = await userCollection.findOne({email: value})
    //     if (user) {
    //         throw new Error();
    //     }
    // })
    // .withMessage("Email must be unique!")


export const userInputsValidation = [
    loginValidation,
    passwordValidation,
    emailValidation,
]

