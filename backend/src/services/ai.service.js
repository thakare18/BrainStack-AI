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
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768
    }
  })

  return response.embeddings;
}

module.exports = {
  generateResponse,
  generateVector
};