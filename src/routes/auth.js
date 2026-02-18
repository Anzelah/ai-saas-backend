const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient() // use prisma to read and write data in your db
const router = express.Router()

// Creating the user
router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body

        //Did they send both the email and password?
        if (!email || !password) {
            return res.status(400).json({ error: "Missing fields "})
        }

        //Does a user with this email exist?
        const existingUser = await prisma.user.findUnique( {
            where: { email },
        })
        if (existingUser) {
            res.status(400).json({ error: "User with this email already exists!"})
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

  router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        // find user with that email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true }
        })
        if (!user) {
            res.status(400).json({ error: "User doesn't exist. Please sign up"})
        }

        // check if password provided matched with one stored in db
        const dbPw = user.password
        const match = await bcrypt.compare(password, dbPw)
        if (!match) {
            res.status(400).json({ error: "Incorrect password. Try again!" })
        }

        // provide a digital id/token
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