require("dotenv").config()
const express = require("express")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const PORT = process.env.PORT || 5000

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const aiRoutes = require("./routes/ai")
const stripeRoutes = require("./routes/stripe")
const webhookRoutes = require("./routes/webhook")
const errorHandler = require("./middleware/errorHandler")

const app = express()
const corsOptions = {
  origin: "https://prismatic-dasik-e44042.netlify.app/", // replace with your deployed URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // if you use cookies/auth headers
};

app.use(cors(corsOptions));
app.use("/api", webhookRoutes)
app.use(express.json())

// rate limit all routes to 100 requests per 15 minutes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 })
app.use(limiter)

app.use("/auth", authRoutes)
app.use("/user", userRoutes)
app.use("/ai", aiRoutes)
app.use("/stripe", stripeRoutes)

app.get("/", (req, res) => {
  res.json({ message: "AI SaaS Backend Running"})
})

app.get("/success", (req, res) => {
  res.json({ message: "Stripe Payment Successful"})
})

app.use(errorHandler)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
