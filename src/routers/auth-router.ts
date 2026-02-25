import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware'
import {authInputsValidation} from "../input-output-types/auth-input-validations";
import {userInputsValidation} from "../input-output-types/user-input-validations";
import {authService} from '../domain/auth-service'
import {HTTP_STATUSES} from "../utils";
import {jwtService} from "../application/jwt-service";
import {authMiddleware} from "../middlewares/auth-middleware";
import {usersQueriesRepository} from "../repositories/users-queries-repository";
import {usersRepository} from "../repositories/users-repository";
import {blackListRepository} from "../repositories/black-list-repository";

export const authRouter = Router();


authRouter.post('/login',
    authInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response,) => {
    const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if(user){
        const accessToken = await jwtService.createAccessJWT(user)
        const refreshToken = await jwtService.createRefreshJWT(user)
        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true});
        res.status(HTTP_STATUSES.OK_200).send({accessToken: accessToken})
    } else {
        res.status(HTTP_STATUSES.UNAUTHORIZED_401).send({errorsMessages: [{
        message: 'Credentials doesn\'t mathc',
        field: 'loginOrEmail',
        }]})
    }
})


authRouter.post('/refresh-token',
    authInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response,) => {
        if(req.cookies.refreshToken) {
            const tokenFromCookies = req.cookies.refreshToken
            const userId = await jwtService.getUserByToken(tokenFromCookies)
            if(userId){
                const user = await usersRepository.findUserById(userId)
                if (user) {
                    const payload = await jwtService.getRefreshTokenPayload(tokenFromCookies);
                    if (!payload) {
                        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
                        return;
                    }
                    await blackListRepository.create({
                        token: tokenFromCookies,
                        expirationDate: new Date(payload.exp * 1000)
                    });
                    const accessToken = await jwtService.createAccessJWT(user)
                    const refreshToken = await jwtService.createRefreshJWT(user)
                    res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true});
                    res.status(HTTP_STATUSES.OK_200).send({accessToken: accessToken})
                } else {
                    res.status(HTTP_STATUSES.UNAUTHORIZED_401)
                }
            }
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

authRouter.post('/logout',
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const payload = await jwtService.getRefreshTokenPayload(refreshToken);
        if (!payload) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        await blackListRepository.create({
            token: refreshToken,
            expirationDate: new Date(payload.exp * 1000)
        });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
        res.sendStatus(HTTP_STATUSES.OK_200);
    })

