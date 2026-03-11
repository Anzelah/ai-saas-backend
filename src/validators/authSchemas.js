const { z } = require("zod")

// Create reusable password schema
const passwordSchema = z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password too long" })
    .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
    .refine((val) => /[!@#$%^&*()?:{}|<>]/.test(val), { message: "Password must contain at least one special character: !@#$%^&*()?:{}|<></>" })

// Create a reusable email Schema
const emailSchema = z.email({ message: "Invalid email format" })

// signup validation
const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

// login validation
const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, { message: "Password can't be empty" })
})


// checkout validation
const checkoutSchema = z.object({
    plan: z.enum(["starter", "pro", "enterprise"], {
        errorMap: () => ({ message: "Invalid subscription plan selected" })
      })
  });

// reset password schema
const resetSchema = z.object({
    token: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

module.exports = { signupSchema, loginSchema, checkoutSchema, resetSchema }