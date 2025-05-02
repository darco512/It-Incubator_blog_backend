module.exports = class UniquenessError extends Error {
    status;
    errors;

    constructor(status: number, message: string, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static BadRequest(message:string, errors= []) {
        return new UniquenessError(400, message, errors);
    }
}

