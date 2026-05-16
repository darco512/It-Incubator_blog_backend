import {Request, Response, Router} from "express";
import {randomUUID} from "crypto";
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {rateLimitMiddleware} from "../middlewares/rate-limit-middleware";
import {authInputsValidation} from "../input-output-types/auth-input-validations";
import {userInputsValidation} from "../input-output-types/user-input-validations";
import {authService} from '../domain/auth-service'
import {HTTP_STATUSES, getClientIp, getRefreshCookieOptions} from "../utils";
import {jwtService} from "../application/jwt-service";
import {authMiddleware} from "../middlewares/auth-middleware";
import {usersQueriesRepository} from "../repositories/users-queries-repository";
import {usersRepository} from "../repositories/users-repository";
import {sessionsRepository} from "../repositories/sessions-repository";
import {SETTINGS} from "../settings";

export const authRouter = Router();

function resolveDeviceId(body: {deviceId?: unknown}): string {
    if (typeof body.deviceId === "string" && body.deviceId.trim() !== "") {
        return body.deviceId.trim();
    }
    return randomUUID();
}

function deviceTitleFromLoginUserAgent(req: Request): string {
    const ua = req.get("user-agent");
    if (typeof ua === "string" && ua.trim() !== "") {
        return ua.trim().slice(0, 512);
    }
    return SETTINGS.DEFAULT_DEVICE_TITLE;
}

authRouter.post('/login',
    rateLimitMiddleware,
    authInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response,) => {
    const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if(user){
        const deviceId = resolveDeviceId(req.body)
        const accessToken = await jwtService.createAccessJWT(user)
        const refreshToken = await jwtService.createRefreshJWT(user, deviceId)
        const times = jwtService.getJwtTimes(refreshToken)
        const deviceName = deviceTitleFromLoginUserAgent(req)
        const ip = getClientIp(req)
        if (times) {
            await sessionsRepository.upsertByUserAndDevice({
                userId: user._id,
                deviceId,
                deviceName,
                ip,
                iat: times.iat,
                exp: times.exp,
            })
        }
        res.cookie('refreshToken', refreshToken, getRefreshCookieOptions(req));
        res.status(HTTP_STATUSES.OK_200).send({accessToken, deviceId})
    } else {
        res.status(HTTP_STATUSES.UNAUTHORIZED_401).send({errorsMessages: [{
        message: 'Credentials doesn\'t mathc',
        field: 'loginOrEmail',
        }]})
    }
})


authRouter.post('/refresh-token',
    async (req: Request, res: Response) => {
        const tokenFromCookies = req.cookies?.refreshToken;
        if (!tokenFromCookies) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const payload = await jwtService.getRefreshTokenPayload(tokenFromCookies);
        if (!payload) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const session = await sessionsRepository.findActiveSession(
            payload.userId,
            payload.deviceId,
            payload.iat,
        );
        if (!session) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const user = await usersRepository.findUserById(payload.userId);
        if (!user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const accessToken = await jwtService.createAccessJWT(user);
        const refreshToken = await jwtService.createRefreshJWT(user, payload.deviceId, payload.iat);
        const times = jwtService.getJwtTimes(refreshToken)
        const ip = getClientIp(req)
        if (!times) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const bumped = await sessionsRepository.bumpSessionAfterRefresh(
            payload.userId,
            payload.deviceId,
            payload.iat,
            ip,
            times.iat,
            times.exp,
        )
        if (!bumped) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        res.cookie('refreshToken', refreshToken, getRefreshCookieOptions(req));
        res.status(HTTP_STATUSES.OK_200).send({ accessToken });
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
    rateLimitMiddleware,
    userInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
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
    rateLimitMiddleware,
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
    rateLimitMiddleware,
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
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const payload = await jwtService.getRefreshTokenPayload(refreshToken);
        if (!payload) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const session = await sessionsRepository.findActiveSession(
            payload.userId,
            payload.deviceId,
            payload.iat,
        );
        if (!session) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        await sessionsRepository.deleteByUserAndDevice(
            payload.userId,
            payload.deviceId,
            payload.iat,
        );
        res.clearCookie('refreshToken', getRefreshCookieOptions(req));
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

