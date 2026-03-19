require("dotenv").config()
const axios = require("axios");
const AppError = require("../utils/AppError");

const HF_API_KEY = process.env.HF_API_KEY; 
if (!HF_API_KEY) {
    throw new AppError("Invalid api key", 500);
}

async function generateAIResponse(userPrompt) {
    try {
      const messages = [
        {
          role: "system",
          content:
            "You are an expert professional cover letter writer. Write a polished, concise cover letter for the job description provided. Make the tone confident, concise, and tailored to the role. Limit to 200–300 words.",
        },
        {
          role: "user",
          content: `Write a tailored cover letter for this job:\n\n${userPrompt}`,
        },
      ];
  
      console.log("Before calling HF");
  
      const response = await axios.post(
        "https://router.huggingface.co/v1/chat/completions",
        {
          model: "deepseek-ai/DeepSeek-V3.2:novita",
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("After calling HF", response.data);
  
      // Correctly read the AI output
      const aiOutput =
        response.data?.choices?.[0]?.message?.content || "";
  
      if (!aiOutput) {
        throw new Error("No text returned from Hugging Face");
      }

      return aiOutput;
    } catch (error) {
      console.error( "Hugging Face AI Error:", error.response?.data || error.message );
      throw AppError("AI service unavailable due to server configuration issue", 500);
    }
  }

module.exports = { generateAIResponse }