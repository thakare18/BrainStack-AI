const { GoogleGenerativeAI } = require("@google/generative-ai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateResponse(content) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(content);
  const response = result.response;
  return response.text();
}


async function generateVector(content) {

  const response = await ai.model.embedContent({
    model: "gemini-3-flash-preview",
    contents: content,
    config: {
      temperature :  0.7,  // -1<= temperature <= 1
      systemInstruction:"You are BrainStackAI, a professional and friendly AI assistant that provides clear, accurate, and easy-to-understand answers, step-by-step guidance, and well-structured code while staying honest, safe, and helpful at all times." 
    }
  })

  return response.embeddings[0].values
}

module.exports = {
  generateResponse,
  generateVector
};