const { ZodError } = require("zod")

module.exports = (schema, property = "body") => (req, res, next) => {
    try {
        schema.parse(req[property]) // validate the request
        next()   
    } catch(err) {
        if (err instanceof ZodError) {
            return res.status(400).json({ error: err.issues[0].message })
        }
        next(err)// pass other errors to global errorhandler(tobeimplemented next)
    }
}