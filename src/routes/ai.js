const express = require("express")
const { PrismaClient } = require("../generated")
const authMiddleware = require("../middleware/auth")
const { generateAIResponse } = require("../services/aiService")
const validateMiddleware = require("../middleware/validate")
const { generateSchema, querySchema, paramSchema } = require("../validators/aiSchema")

const prisma = new PrismaClient()
const router = express.Router()

router.post("/generate", authMiddleware, validateMiddleware(generateSchema), async (req, res) => {
    try { 
        // Check the user has sent a prompt. Validation middleware runs here
        const { prompt } = req.body
        
        // find the user and subscriptions from db
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { subscription: true },
        })
        if (!user) {
            return res.status(401).json({ error: "User not found"})
        }

        // fetch the user's subscription
        const subscription = user.subscription
        if (!subscription) {
            return res.status(404).json({ error: "Subscription not found"})
        }

        // check the credits available
        if (subscription.credits <= 0) {
            return res.status(429).json({ error: "You hit your usage limit. Please wait for reset or upgrade your plan"})
        }

        // Call openAI
        let aiResponse
        try {
            aiResponse = await generateAIResponse(prompt)
        } catch(error) {
            if (error.message === "AI_SERVICE_ERROR") {
                return res.status(500).json({ error: "AI Service Unavailable. Please try again later"})
            }
            if (error.message === "OPENAI_KEY_ERROR") {
                return res.status(401).json({ error: "Invalid credentials" })
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
router.get("/history", authMiddleware, validateMiddleware(querySchema, "query"), async (req, res) => {
    try {
        // check if user requested a page/limit. otherwise, default to our values 
        const { page, limit } = req.query

        // calculate the offset(skip value)
        const offset = (page - 1) * limit
        //Get total records number
        const total = await prisma.aIRequest.count({ where: { userId: req.userId} })

        const userHistory = await prisma.aIRequest.findMany({
            where: { 
                userId: req.userId,
            }, 
            select: {
                id: true,
                prompt: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: offset,
            take: limit,
        })

        res.json({ 
            page,
            total, 
            totalPages: Math.ceil(total/limit),
            data: userHistory })

    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch history" })
    }
})

// Expand a specific response from listed history
router.get("/:id", authMiddleware, validateMiddleware(paramSchema, "params"), async(req, res) => {
    try {
        const requestId = req.params.id

        // fetch request from db
        const request = await prisma.aIRequest.findUnique({
            where: {
                id: requestId,
            },
        })

        // check if request exists
        if (!request) {
            return res.status(404).json({ error: "Request not found"})
        }

        // check if the logged in user owns this request
        if (request.userId !== req.userId) {
            return res.status(403).json({ error: "Unauthorized"})
        }

        res.json({
            id: request.id,
            prompt: request.prompt,
            response: request.response,
            createdAt: request.createdAt
        })

    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch the request"})
    }
})
module.exports = router;