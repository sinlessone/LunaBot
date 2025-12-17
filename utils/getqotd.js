const {GoogleGenAI, ApiError} = require("@google/genai")
const config = require("../config.json")

async function getQotd(lastQotd) {
    try {
        const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY_2});
        return await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `Generate a single, engaging "Question of the Day" for a Discord community. 
        
The question should be fun, casual, and safe for work. varied. 
Choose randomly from these styles:
1. "This or That" / "Would you rather" (e.g., "Pancakes or Waffles?")
2. Hypothetical scenarios (e.g., "If you could instantly learn one skill...")
3. Personal favorites or nostalgia (e.g., "What was your favorite cartoon growing up?")
4. Random thought-provoking questions.
5. You are free to choose anything else that you see fit aslong as it is a good icebreaker question 
6. this is the last qotd you generated, please try not to repeat it and generate something unique: ${lastQotd}

IMPORTANT: Output ONLY the question text itself. Do not include quotes or introductory phrases.`
        });
    } catch (e) {
        return "no text generated"
    }
}

module.exports = { getQotd }