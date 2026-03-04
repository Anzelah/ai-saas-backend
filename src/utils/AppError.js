class AppError extends Error {
    constructor(message, statusCode, errorDetails = null ) {
        super(message)

        this.statusCode = statusCode
        this.error = errorDetails
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError;