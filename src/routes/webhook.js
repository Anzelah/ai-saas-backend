require("dotenv").config()
const express = require("express")
const stripe = require("../lib/stripe")
const { PrismaClient } = require("../generated")
const AppError = require("../utils/AppError")

const prisma = new PrismaClient()
const router = express.Router()
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

router.post("/webhook", express.raw({ type: "application/json" }), async(req, res) => {
    // get event data sent by stripe. contains id, type, and related stripe resources under data object
    let event = req.body

    const sig = req.headers['stripe-signature']
    // verify the stripe signature against our secret
    try {
        stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        )
    } catch(error) {
        throw new AppError("Webhook signature verification failed", 400)
    }

    // if payment had been made, and signature verified, update the db
    if (event.type === "checkout.session.completed") {
        const session = event.data.object
        const userId = session.metadata.userId
        const credit = parseInt(session.metadata.credits)

        // update user credits in the database
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: credit }
                }
            })
        } catch (error) {
            throw new AppError("Failed to update user credits", 500)
        }

        // Sent status ok to Stripe otherwise it will retry the webhook later
        res.status(200).json({ received: true })
    }
})

module.exports = router