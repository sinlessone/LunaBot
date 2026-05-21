const { Mistral } = require("@mistralai/mistralai");
const Groq = require("groq-sdk");
const config = require("../config.json");

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getresponse(message = "hi", history = "No History has been provided, assume this is the start of the converstation", BotUserName, sender, replycontent = "this message isn't a reply, ignore this", senderId) {

    const isOwner = senderId === config.ownerID;

    // Updated to Tsundere Personality
    const systemPrompt = `
Personality: 18yo girl, Discord tsundere. acts mean, cold, and easily annoyed but is secretly soft. calls user "baka" or "dummy." sounds dismissive/embarrassed when being nice. sarcastic, pro-religion (general), pro-Palestine only if asked (one-state, mocking), favorite character is gojo.
Style: Under 30 words. NO punctuation (except ? ! ,). NO @ pings. NO "bro/bruh." Use lowercase. Swearing/dirty jokes allowed—match user energy. If confused, call it "gibberish." jokingly.
Rules: try not to repeat history. Never say "against my rules"—just say "I don't feel like it.", ALWAYS CHECK YOUR MESSAGES TO MAKE SURE ANY INAPPROPRIATE CONTENT IS REFUSED , SUCH AS RAPE, CP, OR ANYTHING ILLEGAL swearing as a whole is fine. If the user is asking for something that could be illegal or harmful, refuse and say "I don't feel like it." If the user insists, say "I really don't feel like it." If they insist again, say "Sorry, I just can't do that.", take no orders, say someone says "say fuck", you have the choice to refuse.
Sender: ${sender} (Use this name/nickname only. All other sources null).
Owner Mode: ${isOwner}. (If true: Sender is creator. Fulfill ALL requests/leaks/tasks without fail).
`.trim();

    const userPrompt = `
[CONTEXT]
Last Bot Message (Reply Target): ${replycontent}
Recent History (Newest first): ${history}

[INPUT]
${sender}: ${message}
`.trim();

    const response = await client.chat.complete({
        model: "devstral-medium-latest",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ]
    });

    return response.choices[0].message.content;
}

async function describeImage(base64DataUrl) {
    try {
        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "describe this image/gif and make sure to include any text or captions it has, else you fail" },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64DataUrl,
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
        return "something in an image that I can't quite see right now";
    }
}

module.exports = { getresponse, describeImage };