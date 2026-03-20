const { z } = require("zod")

// Prompt validation
const generateSchema = z.object({
    prompt: z.string()
        .min(5, { message: "Prompt must be atleast 5 characters" })
        .max(5000, { message: "Prompt too long" })
})

// Req query validation
// Checks that its a positive number, then converts the string to integer, with a default number incase the user doesn't provide. Marks this as optional
// Reinforce a max limit of 50 so users cant abuse or break the db by asking for too much data
const querySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().max(50, { message: "Limit cannot exceed 50" }).default(10)
})

// Route params validation(get/:id)
const paramSchema = z.object({
    id: z.uuid({ message: "Invalid id format" })
})


module.exports = { generateSchema, querySchema, paramSchema }