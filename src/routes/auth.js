require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { PrismaClient } = require("../generated")
const validateMiddleware = require("../middleware/validate")
const { signupSchema, loginSchema, forgotPwSchema, resetSchema } = require("../validators/authSchemas")
const AppError = require("../utils/AppError");

const prisma = new PrismaClient() // use prisma to read and write data in your db
const router = express.Router()

// Creating the user
router.post("/signup", validateMiddleware(signupSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body

        //Does a user with this email exist?
        const existingUser = await prisma.user.findUnique( {
            where: { email },
        })
        if (existingUser) {
            throw new AppError("An account with this may exist. Try logging in or resetting your password", 401)
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
        next(error)
    }
  });


  // LOG IN

  router.post("/login", validateMiddleware(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body

        // find user with that email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true },
        })
        if (!user) {
            throw new AppError("Incorrect email address or password", 401)
        }

        // check if password provided matched with one stored in db
        const dbPw = user.password
        const match = await bcrypt.compare(password, dbPw)
        if (!match) {
            throw new AppError("Incorrect email address or password", 401)
        }

        // generate a digital id/token
        const payload = { userId: user.id } 
        const secretKey = process.env.JWT_SECRET

        const token = jwt.sign( payload, secretKey, { expiresIn: "7d" })

        // return the jwt to the frontend for use in further requests
        res.json({ token })

    } catch(error) {
        next(error)
    }

  })

// user clicks forgot password
router.post("/forgot-password", validateMiddleware(forgotPwSchema), async(req, res, next) => {
    try {
        const { email } = req.body
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex")
            const expiry = new Date(Date.now() + 15 * 60 * 1000)
            
            await prisma.user.update({
                where: { email },
                data: {
                    resetToken,
                    resetTokenExpiry: expiry
                }
            })
            // In production you would send email here
            console.log("Reset token:", resetToken)
        }
        // return the same message whether the account exists or not
        res.json({ message: "If the email exists, a reset link has been sent" })
    } catch(error) {
        next(error)
    }
})

// reset their password
router.post("/reset-password", validateMiddleware(resetSchema), async(req, res, next) => {
    try { 
        console.log("Here")
        const { resetToken, newPassword } = req.body
        console.log(resetToken)
        const user = await prisma.user.findFirst({
            where: { 
                resetToken, 
                resetTokenExpiry: { gt: new Date() }
            }
        })

        if (!user) {
            throw new AppError("Invalid or expired reset token", 400)
        }

        const hashedPw = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPw,
                resetToken: null,
                resetTokenExpiry: null
            }
        })
        res.status(200).json({ message: "Password reset succesful" })
    } catch (error) {
        next(error)
    }    
})

module.exports = router;