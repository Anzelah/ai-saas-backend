require("dotenv").config()
const OpenAI = require("openai")
const AppError = require("../utils/AppError");

// create an openai client and authenticate it using my api key
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) { 
    throw new AppError("Invalid api key", 500) 
}
const openai = new OpenAI({ apiKey })

// Call openai apito generate a response based on the prompt provided
async function generateAIResponse(prompt) {
    try {
        const completion  = await openai.responses.create({
            model: "gpt-4o-mini",
            input: [
                { role: "system", content: "You are an expert entepreneur" },
                { role: "user", content: prompt }
            ],
        })
        // extract and return the response to the route
        const openaiResponse = completion.choices[0].message.content
        return openaiResponse
    } catch (error) {
        throw new AppError("AI service unavailable due to server configuration issue", 500)
    }
}

module.exports = { generateAIResponse }