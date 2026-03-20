const express = require("express")
const { PrismaClient } = require("../generated")
const authMiddleware = require("../middleware/auth")
const { generateAIResponse } = require("../services/aiService")
const validateMiddleware = require("../middleware/validate")
const { generateSchema, querySchema, paramSchema } = require("../validators/aiSchemas")
const AppError = require("../utils/AppError");

const prisma = new PrismaClient()
const router = express.Router()

router.post("/generate", authMiddleware, validateMiddleware(generateSchema), async (req, res, next) => {
    try { 
        // Check the user has sent a prompt. Validation middleware runs here
        const { prompt } = req.body
        console.log(prompt)
        
        // find the user and subscriptions from db
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { subscription: true },
        })
        if (!user) {
            throw new AppError("User not found", 401)
        }

        // fetch the user's subscription
        const subscription = user.subscription
        if (!subscription) {
            throw new AppError("Subscription not found", 404)
        }

        // check the credits available
        if (subscription.credits <= 0) {
            throw new AppError("You hit your usage limit. Please wait for reset or upgrade your plan", 429)
        }

        // Call openAI
        let aiResponse
        aiResponse = await generateAIResponse(prompt)        

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
        res.status(200).json({ 
            response: aiResponse,
            credits: updateSubscriptions.credits,
        })

    } catch(error) {
        next(error)
    }
})

// Retrieve a users post history
router.get("/history", authMiddleware, validateMiddleware(querySchema, "query"), async (req, res, next) => {
    try {
        // check if user requested a page/limit. otherwise, default to our values 
        const { page, limit } = querySchema.parse(req.query)

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
        next(error)
    }
})

// Expand a specific response from listed history
router.get("/:id", authMiddleware, validateMiddleware(paramSchema, "params"), async(req, res, next) => {
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
            throw new AppError("Request not found", 404)
        }

        // check if the logged in user owns this request
        if (request.userId !== req.userId) {
            throw new AppError("Unauthorized", 403)
        }

        res.json({
            id: request.id,
            prompt: request.prompt,
            response: request.response,
            createdAt: request.createdAt
        })

    } catch(error) {
        next(error)
    }
})
module.exports = router;