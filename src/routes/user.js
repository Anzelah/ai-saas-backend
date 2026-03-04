const express = require("express")
const { PrismaClient } = require("../generated")
const authMiddleware = require("../middleware/auth")
const AppError = require("../utils/AppError");

const prisma = new PrismaClient()
const router = express.Router()

// Protected route to load user info. Middleware is called
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { subscription: true },
        })

        if (!user) {
            throw new AppError("User not found", 404)
        }

        res.json({
            id: user.id,
            email: user.email,
            plan: user.subscription.plan,
            credits: user.subscription.credits,
            createdAt: user.createdAt,
        })
    } catch(error) {
        next(error)
    }
})

module.exports = router;