require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { PrismaClient } = require("../generated")
const validateMiddleware = require("../middleware/validate")
const { signupSchema, loginSchema } = require("../validators/authSchema")

const prisma = new PrismaClient() // use prisma to read and write data in your db
const router = express.Router()

// Creating the user
router.post("/signup", validateMiddleware(signupSchema), async (req, res) => {
    try {
        const { email, password } = req.body

        //Does a user with this email exist?
        const existingUser = await prisma.user.findUnique( {
            where: { email },
        })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists"})
        }

        // hash the password with bcrypt
        hashedPw = await bcrypt.hash(password, 10)
    
        // Create user in db using the generated id, email, and hashed pw
        const user = await prisma.user.create({ 
            data: {
                email,
                password: hashedPw,
                subscription: { create: {} }
            },
        })

        // Send this response if all conditions are met
        res.status(201).json({ message: "User created successfully!"})

    } catch(error) {
        res.status(500).json({ error: "Something went wrong" })
    }
  });


  // LOG IN

  router.post("/login", validateMiddleware(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body

        // find user with that email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true },
        })
        if (!user) {
            return res.status(401).json({ error: "User not found. Please sign up"})
        }

        // check if password provided matched with one stored in db
        const dbPw = user.password
        const match = await bcrypt.compare(password, dbPw)
        if (!match) {
            return res.status(401).json({ error: "Invalid password" })
        }

        // generate a digital id/token
        const payload = { userId: user.id } 
        const secretKey = process.env.JWT_SECRET

        const token = jwt.sign( payload, secretKey, { expiresIn: "7d" })

        // return the jwt to the frontend for use in further requests
        res.json({ token })

    } catch(error) {
        res.status(500).json({ error: "Something went wrong" })
    }

  })

  module.exports = router;