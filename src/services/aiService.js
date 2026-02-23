require("dotenv").config()
const OpenAI = require("openai")

// create an openai client and authenticate it using my secret api key
const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey })

// Call openai apito generate a response based on the prompt provided
async function generateAIResponse(prompt) {
    const completion  = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are an expert entepreneur" },
            { role: "user", content: prompt }
        ],
    })

    // extract and return the response to the route
    const openaiResponse = completion.choices[0].message.content
    return openaiResponse
}

module.exports = { generateAIResponse }