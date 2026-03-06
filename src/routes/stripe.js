const express = require("express")
const stripe = require("../lib/stripe")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

// create a checkout session
router.post("/create-checkout-session", authMiddleware, async(req, res) => {
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
            price_data: {
                currency: "usd",
                product_data: {
                    name: `${credits} AI Credits`
                },
                unit_amount: amount
            },
            quantity: 1,
            }],
        success_url: ,
        cancel_url: ,
        metadata: {
            userId: req.userId,
            credits
        }
    })
})