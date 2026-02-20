const express = require("express")
const { PrismaClient } = require("../generated")
const authMiddleware = require("../middleware/auth")

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
            res.status(404).json({ error: "User not found" })
        }

        res.json({
            id: user.id,
            email: user.email,
            plan: user.subscription.plan,
            credits: user.subscription.credits,
            createdAt: user.createdAt,
        })
    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
})

module.exports = router;