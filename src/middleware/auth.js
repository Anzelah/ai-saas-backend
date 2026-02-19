require("dotenv").config()
const jwt = require("jsonwebtoken")

// Verifies the token and attaches userId inside token to req
function authMiddleware (req, res, next) {
    const authHeader = req.headers.authorization

    // retrieve the token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(501).json({ error: "Unauthorized!"})
    }
    const token = authHeader.split(" ")[1]

    // verify if the token is valid
    try {
        const secret = process.env.JWT_SECRET
        const decoded = jwt.verify(token, secret)

        // extract the original user ID inside the token for further queries
        req.userId = decoded.userId
        next()
    } catch(error) {
        res.status(401).json({ error: "Invalid token!"})
    }
}

module.exports = authMiddleware;



