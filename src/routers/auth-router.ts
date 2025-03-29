import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authInputsValidation} from "../input-output-types/auth-input-validations";
import {usersService} from '../domain/users-service'
import {HTTP_STATUSES} from "../utils";

export const authRouter = Router();


authRouter.post('/login',
    authInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response,) => {
    const checkResult = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if(checkResult){
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
})
