require("dotenv").config()
const express = require("express")
const stripe = require("../lib/stripe")
const { PrismaClient } = require("../generated")

const prisma = new PrismaClient()
const router = express.Router()
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

router.post("/webhook", express.raw({ type: "application/json" }), async(req, res) => {
    // get event data sent by stripe. contains id, type, and related stripe resources under data object
    let event;

    const sig = req.headers['stripe-signature']
    // verify the stripe signature against our secret
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        )
    } catch(error) {
        console.error("Webhook signature verification failed:", error.message);
        return res.status(400).send(`Webhook error:  ${error.message}`)
    }

    // if payment had been made, and signature verified, update the db
    // use switch, case statements to handle various event types
    switch(event.type) {
        case "checkout.session.completed":
            const session = event.data.object
            const userId = session.metadata.userId
            const credit = parseInt(session.metadata.credits)

            // update user credits in the database
            try {
                const user = await prisma.user.update({
                    where: { id: userId },
                    data: { credits: { increment: credit } }
                })
            } catch (error) {
                console.error("Failed to update user credits:", error);
                res.status(500).send("Database update failed. Try again later")
            }
            console.log(`Added ${credits} credits to user ${userId}`)
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
        }
        res.send()
})

module.exports = router