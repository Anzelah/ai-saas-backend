require("dotenv").config()
const OpenAI = require("openai")

// create an openai client and authenticate it using my api key
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
    throw new Error("OPENAI_KEY_ERROR")
}
const openai = new OpenAI({ apiKey })

// Call openai apito generate a response based on the prompt provided
async function generateAIResponse(prompt) {
    try {
        const completion  = await openai.responses.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert entepreneur" },
                { role: "user", content: prompt }
            ],
        })
        // extract and return the response to the route
        const openaiResponse = completion.choices[0].message.content
        return openaiResponse
    } catch (error) {
        console.error("Openai error:", error)
        throw new Error("AI_SERVICE_ERROR")
    }
}

module.exports = { generateAIResponse }