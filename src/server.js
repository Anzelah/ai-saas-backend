require("dotenv").config()
const express = require("express")
const cors = require("cors")
const PORT = process.env.PORT || 5000 

const app = express()

app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
  res.json({ message: "AI SaaS Backend Running"})
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
