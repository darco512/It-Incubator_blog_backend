import {Request, Response, Router} from "express";
import {refreshAuthMiddleware} from "../middlewares/refresh-auth-middleware";
import {securityService} from "../domain/security-service";
import {HTTP_STATUSES} from "../utils";

export const securityRouter = Router();

securityRouter.get(
    "/devices",
    refreshAuthMiddleware,
    async (req: Request, res: Response) => {
        if (!req.user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const sessions = await securityService.findSessionsByUserId(req.user._id);
        res.status(HTTP_STATUSES.OK_200).json(sessions);
    },
);

securityRouter.delete(
    "/devices",
    refreshAuthMiddleware,
    async (req: Request, res: Response) => {
        if (!req.user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        await securityService.deleteSessions(req.user._id);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
);

securityRouter.delete(
    "/devices/:deviceId",
    refreshAuthMiddleware,
    async (req: Request, res: Response) => {
        if (!req.user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
            return;
        }
        const device = await securityService.deleteSession(req.user._id, req.params.deviceId as string);
        if (device === null) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        if (device === false) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
            return;
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
);
