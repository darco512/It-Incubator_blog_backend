import type {Request} from "express";

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    UNAUTHORIZED_401: 401,
    FORBIDDEN_403: 403,
    NOT_FOUND_404: 404,
    RATE_LIMIT: 429,
}

export type HttpStatusKeys = keyof typeof HTTP_STATUSES
export type HttpStatusType = (typeof HTTP_STATUSES)[HttpStatusKeys]

export function getParamId(id: string | string[] | undefined): string {
    if (Array.isArray(id)) return id[0];
    return id || '';
}

export function getRefreshCookieOptions(req: Request): {httpOnly: true; secure: boolean} {
    const isSecureConnection =
        req.secure || req.get("x-forwarded-proto") === "https";
    return {
        httpOnly: true,
        secure: isSecureConnection,
    };
}

export function getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
        return forwarded.split(",")[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded[0]) {
        return forwarded[0].split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
}
