const { getresponse, describeImage } = require("../utils/getresponse");
const { unfurl } = require('unfurl.js');
const sharp = require('sharp');
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

                for (let i = 0; i < 6; i++) {
                    const attachment = latestMessage.attachments.find(a => a.contentType?.startsWith('image/'));
                    if (attachment) {
                        targetImageUrl = attachment.url;
                        if (attachment.contentType === 'image/gif') mediaType = "GIF";
                        break;
                    }
                    const embed = latestMessage.embeds.find(e => e.type === 'gifv' || e.image || e.thumbnail);
                    if (embed) {
                        targetImageUrl = embed.image?.proxyURL || embed.thumbnail?.proxyURL || embed.image?.url || embed.thumbnail?.url;
                        if (embed.type === 'gifv' || targetImageUrl?.toLowerCase().includes('.gif')) mediaType = "GIF";
                        break;
                    }
                    await sleep(500);
                    latestMessage = await message.channel.messages.fetch(message.id);
                }

                if (!targetImageUrl) {
                    const urlMatch = message.content.match(/(https?:\/\/[^\s]+)/i);
                    if (urlMatch) {
                        try {
                            const result = await unfurl(urlMatch[0], { timeout: 3000 });
                            targetImageUrl = result.open_graph?.images?.[0]?.url ||
                                result.twitter_card?.images?.[0]?.url ||
                                result.oEmbed?.thumbnails?.[0]?.url;
                            if (targetImageUrl?.toLowerCase().includes('.gif')) mediaType = "GIF";
                        } catch (e) { console.log("Unfurl error:", e.message); }
                    }
                }

                let finalMessageContent = message.content;

                if (targetImageUrl) {
                    try {
                        const imgResponse = await fetch(targetImageUrl, {
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        if (imgResponse.ok) {
                            let buffer = Buffer.from(await imgResponse.arrayBuffer());
                            let contentType = imgResponse.headers.get('content-type') || 'image/jpeg';

                            // --- NEW: GIF FIRST FRAME EXTRACTION ---
                            if (mediaType === "GIF" || contentType === "image/gif") {
                                console.log("[DEBUG] Extracting first frame from GIF...");
                                buffer = await sharp(buffer, { page: 0 }) // Page 0 is the first frame
                                    .toFormat('jpeg')
                                    .toBuffer();
                                contentType = "image/jpeg"; // Tell Groq it's now a JPEG
                            }

                            const base64DataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
                            const mediaDescription = await describeImage(base64DataUrl);

                            finalMessageContent = `[SYSTEM: User sent a ${mediaType}. It shows: "${mediaDescription} if it seems like a meme treat it as so, if it has a caption assume the words belong to the user and address him instead of who is in the image"]\n\n${message.content}`;
                        }
                    } catch (err) {
                        console.error(`[Media Error]`, err.message);
                    }
                }

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

                responsetext = (responsetext || "i'm confused lol").replace(/<@!?(\d+)>|@everyone|@here/g, '(no pings)');

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