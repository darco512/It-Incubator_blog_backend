import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authInputsValidation} from "../input-output-types/auth-input-validations";
import {usersService} from '../domain/users-service'
import {HTTP_STATUSES} from "../utils";
import {jwtService} from "../application/jwt-service";
import {authMiddleware} from "../middlewares/auth-middleware";

export const authRouter = Router();


authRouter.post('/login',
    authInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response,) => {
    const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if(user){
        const token = await jwtService.createJWT(user)
        res.status(HTTP_STATUSES.OK_200).send({accessToken: token})
    } else {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send({errorsMessages: [{
        message: 'Credentials doesn\'t mathc',
        field: 'loginOrEmail',
        }]})
    }
})

authRouter.get('/me',
    authMiddleware,
    async (req: Request, res: Response) => {
        if(!req.user){
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }
        const user = {
            email: req.user.email,
            login: req.user.login,
            userId: req.user._id.toString()
        }
        res.status(HTTP_STATUSES.OK_200).json(user)
    })
