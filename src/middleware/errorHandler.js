const APP_ERROR_MESSAGE = {
    serverError: "Something went wrong. Please try again later.",
};
  
function errorMiddleware(err, req, res, next) {
    console.error(err) // log errors for internal debugging

    const status = err.statusCode || 500
    const message = status === 500 ? APP_ERROR_MESSAGE.serverError : err.message; // hide error message for unexpected errors(security)
    const errors = err.error || null

    res.status(status).json({ status, message, error: errors })
}

module.exports = errorMiddleware