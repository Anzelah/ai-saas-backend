const { ZodError } = require("zod")

module.exports = (schema, property = "body") => (req, res, next) => {
    try {
        schema.parse(req[property]) // validate the request
        next()   
    } catch(err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                errors: err.errors.map(e => ({ field: e.path.join("."), message: e.message }))
            })
        }
        next(err)// pass other errors to global errorhandler(tobeimplemented next)
    }
}