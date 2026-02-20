require("dotenv").config()
const express = require("express")
const cors = require("cors")
const PORT = process.env.PORT || 5000

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const aiRoutes = require("./routes/ai")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/auth", authRoutes)
app.use("/user", userRoutes)
app.use("/ai", aiRoutes)


app.get("/", (req, res) => {
  res.json({ message: "AI SaaS Backend Running"})
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
