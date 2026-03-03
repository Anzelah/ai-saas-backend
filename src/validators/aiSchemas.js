const { z } = require("zod")

// Prompt validation
const generateSchema = z.object({
    prompt: z.string()
    .min(5, { message: "Prompt must be atleast 5 characters" })
    .max(2000, { message: "Prompt too long" })
})

// Route params validation(get/:id)
const paramSchema = z.object({
    id: z.uuid({ message: "Invalid id format" })
})

module.exports = { generateSchema, paramSchema }