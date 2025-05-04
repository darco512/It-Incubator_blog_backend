import {Request, Response, NextFunction} from "express";
import {jwtService} from "../application/jwt-service";
import {usersService} from "../domain/users-service";
import {HTTP_STATUSES} from "../utils";

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "qwerty";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
    }

    const token = req.headers.authorization.split(' ')[1]

    const userId = await jwtService.getUserByToken(token)

    if (userId) {
        req.user = await usersService.findUserById(userId)
        console.log(req.user)
        next()
    } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }

}