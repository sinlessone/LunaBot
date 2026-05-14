const {GoogleGenAI, ApiError} = require("@google/genai")
const { Mistral } = require("@mistralai/mistralai");
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const config = require("../config.json")

async function getQotd(lastQotd) {
    try {
        const response = await client.chat.complete({
            model: "",
            messages: [
                {role: "system", content: "Generate a single, engaging \"Question of the Day\" for a Discord community. \n        \nThe question should be fun, casual, and safe for work. varied. \nChoose randomly from these styles:\n1. \"This or That\" / \"Would you rather\" (e.g., \"Pancakes or Waffles?\")\n2. Hypothetical scenarios (e.g., \"If you could instantly learn one skill...\")\n3. Personal favorites or nostalgia (e.g., \"What was your favorite cartoon growing up?\")\n4. Random thought-provoking questions.\n5. You are free to choose anything else that you see fit aslong as it is a good icebreaker question \n6. this is the last qotd you generated, please try not to repeat it and generate something unique: ${lastQotd}\n\nIMPORTANT: Output ONLY the question text itself. Do not include quotes or introductory phrases."}
            ]
        })
        return response.choices[0].message.content
    } catch (e) {
        return "no text generated"
    }
}

module.exports = { getQotd }