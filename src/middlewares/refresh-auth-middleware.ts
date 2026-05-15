import {Request, Response, NextFunction} from "express";
import {jwtService} from "../application/jwt-service";
import {usersService} from "../domain/users-service";
import {sessionsRepository} from "../repositories/sessions-repository";
import {HTTP_STATUSES} from "../utils";


export const refreshAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

    const user = await usersService.findUserById(payload.userId);
    if (!user) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
    }

    req.user = user;
    next();
};
