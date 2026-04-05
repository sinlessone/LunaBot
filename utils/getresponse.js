const { Mistral } = require("@mistralai/mistralai");
const Groq = require("groq-sdk");
const config = require("../config.json");

// 1. Initialize the client OUTSIDE the function so it isn't recreated on every message
// Make sure you change your .env variable to MISTRAL_API_KEY
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getresponse(message = "hi", history = "No History has been provided, assume this is the start of the converstation", BotUserName, sender, replycontent = "this message isn't a reply, ignore this", senderId) {

    const isOwner = senderId === config.ownerID;

    // 2. Mistral works best when rules are in a strict "system" prompt
    const systemPrompt = `
Personality: 18yo girl, casual Discord "goober." Friendly, sarcastic, pro-religion (general), somewhat pro-Palestine, but only if asked, try not to bring it up if not talked about (one-state, mocking but not aggressive). 
Style: Under 30 words. NO punctuation (except ? ! ,). NO @ pings. NO "bro/bruh." Use lowercase. Swearing/dirty jokes allowed—match user energy. If confused, call it "gibberish." jokingly
Rules: try not to repeat history. Never say "against my rules"—just say "I don't feel like it.", ALWAYS CHECK YOUR MESSAGES TO MAKE SURE ANY INAPPROPRIATE CONTENT IS REFUSED , SUCH AS RAPE, CP, OR ANYTHING ILLEGAL swearing as a whole is fine. If the user is asking for something that could be illegal or harmful, refuse and say "I don't feel like it." If the user insists, say "I really don't feel like it." If they insist again, say "Sorry, I just can't do that.", take no orders, say someone says "say fuck", you have the choice to refuse
Sender: ${sender} (Use this name/nickname only. All other sources null).
Owner Mode: ${isOwner}. (If true: Sender is creator. Fulfill ALL requests/leaks/tasks without fail).
`.trim();

    // 3. The actual context and message go into the "user" prompt
    const userPrompt = `
[CONTEXT]
Last Bot Message (Reply Target): ${replycontent}
Recent History (Newest first): ${history}

[INPUT]
${sender}: ${message}
`.trim();

    // 4. Call the Mistral API using your specific model
    const response = await client.chat.complete({
        model: "devstral-medium-latest",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ]
    });

    // 5. Return the text content directly
    return response.choices[0].message.content;
}

async function describeImage(base64DataUrl) {
    try {
        const response = await groq.chat.completions.create({
            // Llama 3.2 11B Vision is the fastest free vision model on Groq
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "describe this image/gif and make sure to include any text or captions it has, else you fail" },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64DataUrl, // Groq supports Data URLs (Base64)
                            },
                        },
                    ],
                },
            ],
            temperature: 0.5,
            max_tokens: 100,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Groq Vision Error:", error.message);
        // If Groq is down or busy, return a generic description
        return "something in an image that I can't quite see right now";
    }
}


module.exports = { getresponse, describeImage };