const {getresponse} = require("./getresponse");
const path = require("path");
const fs = require("fs");
const { ApiError } =  require("@google/genai")
const config = require("../config.json");
module.exports = {
    async handleaichat(message, client, ) {
        try {
            if (message.member.user.bot) {
                return
            }
            if (message.mentions.has(client.user)) {
                await message.channel.sendTyping();
                const historydata = await message.channel.messages.fetch({
                    limit: 20,
                    before: message.id
                })
                const historyarray = historydata.map(item => ({
                    author: `${item.author.displayName} OR ${item.author.username}`,
                    content: item.content
                }))

                const history = JSON.stringify(historyarray);
                let reference
                if (message.reference) {
                    reference = await message.channel.messages.fetch(message.reference.messageId)
                }
                const response = await getresponse(message.content, history, client.user.username, `display name: ${message.author.displayName} OR username: ${message.author.username}`, reference, message.author.id)
                let responsetext = response.text
                if (/<@!?(\d+)>|<@&!?(\d+)>|@everyone|@here/g.test(responsetext)) {
                    responsetext = responsetext.replace(/<@!?(\d+)>|<@&!?(\d+)>|@everyone|@here/g, '(Not Allowed to ping that)');
                }
                responsetext = responsetext || `An error occurred and the bot did not generate any text, please contact <@${config.ownerID}>`
                if (responsetext.length > 2000) {
                    const filePath = path.join(__dirname, 'message.txt');
                    fs.writeFileSync(filePath, responsetext, 'utf8');

                    await message.reply({
                        files: [filePath]
                    })
                    fs.unlinkSync(filePath);
                } else {
                    await message.reply(responsetext)
                }
            }
        } catch(error) {
            console.log(error)
            if (error instanceof ApiError) {
                if (error.status === 503 || error.status === 429) {
                    return await message.reply("The AI model is currently overloaded, please retry later")
                } else {
                    await message.reply("An unhandled error occurred, if persistent, contact the bot owner.")
                }
            } else {
                await message.reply("An unhandled error occurred, if persistent, contact the bot owner.")

            }

        }
    }
}