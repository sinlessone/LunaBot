const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const {execute, db} = require("../utils/db");
const { v4: uuidv4 } = require('uuid');
const {presets} = require("../data/embed");
async function handleSuggestions(message) {
    const suggestion = message.content
    const id = uuidv4()
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId("upvote")
            .setLabel("0")
            .setEmoji("👍")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("preview")
            .setLabel("0")
            .setEmoji("#️⃣")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("downvote")
            .setLabel("0")
            .setEmoji("👎")
            .setStyle(ButtonStyle.Danger)
    )
await message.channel.send({
        embeds: [presets.info("", suggestion).setAuthor({
            name: `Suggestion | ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }) ?? message.author.defaultAvatar
        })
            .setFooter({
                text: `(ID: ${id})`
            })
        ],
        components: [row]
    }
)
    .then(async (data) => {
        await execute(db, "INSERT INTO suggestions(serverId, suggestionMessageId, suggestion, suggestionId, suggesterId, upvotes, downvotes) VALUES (?, ?, ?, ?, ?, ?, ?)" ,[message.guild.id , data.id, message.content, id, message.member.id, 0, 0])
        await data.startThread({
            name: "suggestion discussion"
        })
        message.delete()
    })
}

module.exports = { handleSuggestions }