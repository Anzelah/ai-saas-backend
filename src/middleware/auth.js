require("dotenv").config()
const jwt = require("jsonwebtoken")

// Get the header containing token
function authMiddleware (req, res, next) {
    const authHeader = req.headers.authorization
}

if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(501).json({ error: "Unauthorized!"})
}
const token = authHeader.split(" ")[1]

// verify if the token is valid
try {
    const secret = process.env.JWT_SECRET
    const decoded = jwt.verify(token, secret)

    // attaches userId inside token to request so the user uses the token for future requests
    req.userId = decoded.userId
    next()
} catch(error) {
    res.status(401).json({ error: "Invalid token!"})
}

module.exports = authMiddleware;



