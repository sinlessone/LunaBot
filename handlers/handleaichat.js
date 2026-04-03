const { getresponse, describeImage } = require("../utils/getresponse");
const { unfurl } = require('unfurl.js'); // The magic package
const path = require("path");
const fs = require("fs");
const config = require("../config.json");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    async handleaichat(message, client) {
        try {
            if (message.member.user.bot) return;

            if (message.mentions.has(client.user)) {
                await message.channel.sendTyping();

                let targetImageUrl = null;
                let mediaType = "image";
                let latestMessage = message;

                // --- 1. THE MEDIA HUNT ---
                for (let i = 0; i < 6; i++) {
                    // Check Attachments (Direct uploads)
                    const attachment = latestMessage.attachments.find(a => a.contentType?.startsWith('image/'));
                    if (attachment) {
                        targetImageUrl = attachment.url;
                        if (attachment.contentType === 'image/gif') mediaType = "GIF";
                        break;
                    }

                    // Check existing Discord Embeds
                    const embed = latestMessage.embeds.find(e => e.type === 'gifv' || e.image || e.thumbnail);
                    if (embed) {
                        targetImageUrl = embed.image?.proxyURL || embed.thumbnail?.proxyURL || embed.image?.url || embed.thumbnail?.url;
                        if (embed.type === 'gifv' || targetImageUrl?.includes('.gif')) mediaType = "GIF";
                        break;
                    }

                    await sleep(500);
                    latestMessage = await message.channel.messages.fetch(message.id);
                }

                // --- 2. UNIVERSAL LINK DECODER (unfurl.js) ---
                // If we still don't have a URL, use unfurl to find the hidden image in ANY link
                if (!targetImageUrl) {
                    const urlMatch = message.content.match(/(https?:\/\/[^\s]+)/i);
                    if (urlMatch) {
                        console.log(`[DEBUG] Unfurling link: ${urlMatch[0]}`);
                        try {
                            const result = await unfurl(urlMatch[0], { timeout: 3000 });

                            // unfurl.js checks OpenGraph, Twitter, and OEmbed automatically
                            targetImageUrl = result.open_graph?.images?.[0]?.url ||
                                result.twitter_card?.images?.[0]?.url ||
                                result.oEmbed?.thumbnails?.[0]?.url;

                            if (targetImageUrl && targetImageUrl.includes('.gif')) mediaType = "GIF";
                        } catch (e) {
                            console.log("Unfurl failed:", e.message);
                        }
                    }
                }

                let finalMessageContent = message.content;

                // --- 3. FETCH & VISION (Groq/Llama 4) ---
                if (targetImageUrl) {
                    try {
                        const imgResponse = await fetch(targetImageUrl, {
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                        });

                        if (imgResponse.ok) {
                            const arrayBuffer = await imgResponse.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);
                            const contentType = imgResponse.headers.get('content-type') || 'image/gif';
                            const base64DataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;

                            const mediaDescription = await describeImage(base64DataUrl);
                            finalMessageContent = `[SYSTEM: User sent a ${mediaType}. It shows: "${mediaDescription}"]\n\n${message.content}`;
                        }
                    } catch (err) {
                        console.error(`[Media Error]`, err.message);
                    }
                }

                // --- 4. HISTORY & RESPONSE ---
                const historydata = await message.channel.messages.fetch({ limit: 15, before: message.id });
                const history = JSON.stringify(historydata.map(item => ({
                    author: item.author.displayName || item.author.username,
                    content: item.content
                })));

                let reference = message.reference ? await message.channel.messages.fetch(message.reference.messageId) : null;

                let responsetext = await getresponse(
                    finalMessageContent,
                    history,
                    client.user.username,
                    message.author.displayName,
                    reference?.content || "No reply target",
                    message.author.id
                );

                responsetext = (responsetext || "gibberish").replace(/<@!?(\d+)>|@everyone|@here/g, '(no pings)');

                if (responsetext.length > 2000) {
                    const filePath = path.join(__dirname, 'message.txt');
                    fs.writeFileSync(filePath, responsetext, 'utf8');
                    await message.reply({ files: [filePath] });
                    fs.unlinkSync(filePath);
                } else {
                    await message.reply(responsetext);
                }
            }
        } catch(error) {
            console.error("[CRITICAL]", error);
            await message.reply("my brain is lagging 😭");
        }
    }
}