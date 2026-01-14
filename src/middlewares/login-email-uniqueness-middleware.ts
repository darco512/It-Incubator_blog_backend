const  UniquenessError = require( "../exeptions/uniquenessError" );
import {Request, Response, NextFunction} from 'express';

module.exports = function (err: any, req: Request, res: Response, next: NextFunction) {
    console.log(err)
    if(err instanceof UniquenessError) {
        return res.status(err.status).json({message: err.message, errors: err.errors});
    }
    return res.status(500).json({message: "Unexpected error"});
}