import {Request, Response, NextFunction} from "express";
import {requestCollection, runDB} from "../db/mongo-db";
import {HTTP_STATUSES, getClientIp} from "../utils";
import {SETTINGS} from "../settings";

function getRequestUrl(req: Request): string {
    const raw = req.originalUrl || req.baseUrl || "";
    return raw.split("?")[0];
}

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers["x-rate-limit-checked"] === "1") {
        next();
        return;
    }
    req.headers["x-rate-limit-checked"] = "1";

    const URL = getRequestUrl(req);
    if (URL.startsWith(SETTINGS.PATH.TESTS)) {
        next();
        return;
    }

    const dbOk = await runDB(SETTINGS.MONGO_URL);
    if (!dbOk) {
        res.sendStatus(503);
        return;
    }

    const IP = getClientIp(req);
    const date = new Date();

    await requestCollection.insertOne({IP, URL, date});

    const windowStart = new Date(Date.now() - SETTINGS.RATE_LIMIT_WINDOW_MS);
    const count = await requestCollection.countDocuments({
        IP,
        URL,
        date: {$gte: windowStart},
    });

    if (count > SETTINGS.RATE_LIMIT_MAX_REQUESTS) {
        res.sendStatus(HTTP_STATUSES.RATE_LIMIT);
        return;
    }

    next();
};
