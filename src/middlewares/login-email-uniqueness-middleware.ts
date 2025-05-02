const  UniquenessError = require( "../exeptions/uniquenessError" );

module.exports = function (err: UniquenessError, req, res, next) {
    console.log(err)
    if(err instanceof UniquenessError) {
        return res.status(err.status).json({message: err.message, errors: err.errors});
    }
    return res.status(500).json({message: "Unexpected error"});
}