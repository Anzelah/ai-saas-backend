const express = require("express")
const { PrismaClient } = require("../generated")
const authMiddleware = require("../middleware/auth")
const { generateAIResponse } = require("../services/aiService")

const prisma = new PrismaClient()
const router = express.Router()

router.post("/generate", authMiddleware, async (req, res) => {
    try { 
        // Check the user has sent a prompt
        const { prompt } = req.body
        if(!prompt || prompt.trim().length === 0) {
            return res.json(400).res.json({ error: "Prompt is required"})
        }
        
        // find the user and subscriptions from db
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { subscription: true },
        })
        if (!user) {
            res.status(404).json({ error: "User not found"})
        }

        // fetch the user's subscription
        const subscription = user.subscription
        if (!subscription) {
            res.status(404).json({ error: "Subscription not found"})
        }

        // check the credits available
        if (subscription.credits <= 0) {
            res.status(429).json({ error: "You hit your usage limit. Please wait for reset or upgrade your plan"})
        }

        // User has subscription with enough credits, now backend can generate a response
        // temporary fake response for testing
        let aiResponse
        try {
            aiResponse = await generateAIResponse(prompt)
        } catch(error) {
            if (error.message === "AI_SERVICE_ERROR") {
                res.status(500).json({ error: "AI Service Unavailable. Please try again later"})
            }
            if (error.message === "OPENAI_KEY_ERROR") {
                res.status(501).json({ error: "Something went wrong" })
            }
            //unexpected error
            console.error("Unexpected Error:", error)
            res.status(500).json({ error: "Server error" })
        }
        // to add a thorough error handling logic according to error message received from ai
        // might not need apikey error handling because it will automatically crash on project initialization
        

        // Save request in db for history + record for product usage
        await prisma.aIRequest.create({
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

// Retrieve a users post history
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const userHistory = await prisma.aIRequest.findMany({
            where: { 
                userId: req.userId,
            }, 
            select: {
                prompt: true,
                response: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        })

        res.json(userHistory)
    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch history" })
    }
})

module.exports = router;