require("dotenv").config()
const express = require("express")
const stripe = require("../lib/stripe")
const plans = require("../config/plans")
const validateMiddleware = require("../middleware/validate")
const { checkoutSchema } = require("../validators/authSchemas")
const authMiddleware = require("../middleware/auth")
const AppError = require("../utils/AppError")

const router = express.Router()
// create a checkout session
router.post("/create-checkout-session", authMiddleware, validateMiddleware(checkoutSchema), async(req, res, next) => {
    try {
        const { plan } = req.body
        const selectedPlan = plans[plan]
 
        const session = await stripe.checkout.sessions.create({ // server to server communication with stripe
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: selectedPlan.name,
                    },
                    unit_amount: selectedPlan.price
                },
                quantity: 1,
                }],
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                userId: req.userId,
                plan,
                credits: selectedPlan.credits,
            }
        })

        res.json({ url: session.url })
    } catch(error) {
        next(error)
    }
})

module.exports = router