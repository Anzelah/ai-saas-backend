const express = require("express")
const { PrismaClient } = require("../generated")
const authMiddleware = require("../middleware/auth")

const prisma = new PrismaClient()
const router = express.Router()

router.post("/generate", authMiddleware, async (req, res) => {
    try { 
        // Check the user has sent a prompt
        const { prompt } = req.body
        if(!prompt) {
            return res.json(400).res.json({ error: "Prompt is required"})
        }
        
        // find the user and ssubscriptions from db
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { subscription: true },
        })
        if (!user) {
            res.status(400).json({ error: "User not found"})
        }

        // fetch the user's subscription
        const subscription = user.subscription
        if (!subscription) {
            res.status(400).json({ error: "Subscription not found"})
        }

        // check the credits available
        if (subscription.credits <= 0) {
            res.status(403).json({ error: "No credits remaining"})
        }

        // User has subscription with enough credits, now backend can generate a response
        // temporary fake response for testing
        const aiResponse = `Ai response to: ${prompt}`

        // Save request in db for history + record for product usage
        await prisma.aiRequest.create({
            data: {
                prompt,
                response: aiResponse,
                userId: user.id,
            },
        })

        // backend deducts credits
        const updateSubscriptions = await prisma.subscription.update({
            where: { userId: user.id },
            data: {
                credits: { decrement: 1 },
            },
        })

        //backend returns response to user
        res.json({ 
            response: aiResponse,
            credits: updateSubscriptions.credits,
        })

    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
})

module.exports = router;