import {Request, Response, NextFunction} from "express";

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "qwerty";


export const baseAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers['authorization'] as string;
    if (!authorization) {
        res.sendStatus(401);
        return;
    }

    const [authType, token] = authorization.split(' ');

    if (authType !== 'Basic') {
        res.sendStatus(401);
        return;
    }

    const credentials = Buffer.from(token, 'base64').toString('utf-8');

    const [username, password] = credentials.split(':');

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        res.sendStatus(401);
        return;
    }

    next();
}