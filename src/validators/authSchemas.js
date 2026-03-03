const { z } = require("zod")

// signup validation
const signupSchema = z.object({
    email: z.email({ message: "Invalid email format"}),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .max(100, { message: "Password too long" })
        .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
        .refine((val) => /[!@#$%^&*()?:{}|<>]/.test(val), { message: "Password must contain at least one special character: !@#$%^&*()?:{}|<></>" })
})

// login validation
const loginSchema = z.object({
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(8, { message: "Password can't be less than 8 characters" })
})

module.exports = { signupSchema, loginSchema }