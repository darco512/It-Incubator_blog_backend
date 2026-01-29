import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authInputsValidation} from "../input-output-types/auth-input-validations";
import {userInputsValidation} from "../input-output-types/user-input-validations";
import {authService} from '../domain/auth-service'
import {HTTP_STATUSES} from "../utils";
import {jwtService} from "../application/jwt-service";
import {authMiddleware} from "../middlewares/auth-middleware";
import {usersQueriesRepository} from "../repositories/users-queries-repository";

export const authRouter = Router();


authRouter.post('/login',
    authInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response,) => {
    const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if(user){
        const token = await jwtService.createJWT(user)
        res.status(HTTP_STATUSES.OK_200).send({accessToken: token})
    } else {
        res.status(HTTP_STATUSES.UNAUTHORIZED_401).send({errorsMessages: [{
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


authRouter.post('/registration',
    userInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        // Check which field is duplicated before creating user
        const existingUserByLogin = await usersQueriesRepository.findUserByLogin(req.body.login);
        const existingUserByEmail = await usersQueriesRepository.findUserByEmail(req.body.email);
        
        if (existingUserByLogin) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send({errorsMessages: [{
                message: 'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
                field: 'login',
            }]})
            return;
        }
        
        if (existingUserByEmail) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send({errorsMessages: [{
                message: 'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
                field: 'email',
            }]})
            return;
        }
        
        const user = await authService.createUser(req.body.login, req.body.email, req.body.password)
        if (user) {
            res.status(HTTP_STATUSES.NO_CONTENT_204).send({message: "Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere"})
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send({errorsMessages: [{
                    message: 'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
                    field: 'loginOrEmail',
                }]})
        }
    })

authRouter.post('/registration-confirmation',
    async (req: Request, res: Response,) => {
        const result = await authService.confirmEmail(req.body.code);
        if(result){
            res.status(HTTP_STATUSES.NO_CONTENT_204).send({message: "Email was verified. Account was activated"})
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send({errorsMessages: [{
                    message: 'If the confirmation code is incorrect, expired or already been applied',
                    field: 'code',
                }]})
        }
    })

authRouter.post('/registration-email-resending',
    async (req: Request, res: Response) => {
        const result = await authService.resendCode(req.body.email);
        if(result){
            res.status(HTTP_STATUSES.NO_CONTENT_204).send({message: "Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere"})
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send({errorsMessages: [{
                    message: 'If the inputModel has incorrect values or if email is already confirmed',
                    field: 'email',
                }]})
        }
    })