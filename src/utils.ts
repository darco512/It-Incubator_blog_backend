export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    UNAUTHORIZED_401: 401,
    NOT_FOUND_404: 404,
}

export type HttpStatusKeys = keyof typeof HTTP_STATUSES
export type HttpStatusType = (typeof HTTP_STATUSES)[HttpStatusKeys]

// Helper to safely get string from req.params.id (handles string | string[])
export function getParamId(id: string | string[] | undefined): string {
    if (Array.isArray(id)) return id[0];
    return id || '';
}