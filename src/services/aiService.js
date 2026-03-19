require("dotenv").config()
const axios = require("axios");
const AppError = require("../utils/AppError");

const HF_API_KEY = process.env.HF_API_KEY; 
if (!HF_API_KEY) {
    console.log('here')
    console.log("HF-API-KEY")
    throw new AppError("Invalid api key", 500);
}

async function generateAIResponse(userPrompt) {
    try {
        // Prepare the full instruction for the model
        const promptText = `You are a professional cover letter writer. Write a polished, concise cover letter for the following job description: ${userPrompt}. Make the tone confident, concise, and tailored to the role. Limit to 200–300 words.`;

        // Call Hugging Face Inference API
        const response = await axios.post(
        "https://api-inference.huggingface.co/models/google/flan-t5-large",
        { inputs: promptText },
        { headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
            },
        });

        // Hugging Face sometimes returns an array of objects with generated_text
        let aiOutput = "";
        if (response.data && Array.isArray(response.data)) {
            aiOutput = response.data[0]?.generated_text || "";
        } else if (response.data?.generated_text) {
            aiOutput = response.data.generated_text;
        }

        if (!aiOutput) {
            throw new Error("No text returned from Hugging Face");
        }

        return aiOutput;
    } catch (error) {
        console.error("Hugging Face AI Error:", error.response?.data || error.message);
        throw new AppError(
        "AI service unavailable due to server configuration issue",
        500
        );
    }
}

module.exports = { generateAIResponse }