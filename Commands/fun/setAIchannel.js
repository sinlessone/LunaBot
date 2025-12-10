const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db, serverindb, registerserver} = require('../../utils/db')
const config = require('../../config.json')
const {setAiIds, getAiIds} = require("../../utils/setaiids");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setaichannel")
        .setDescription("Sets the ai chatbot channel")
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("The channel to set it to")
            .setRequired(true)
        ),
    ownerOnly: true,

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");
        const serverid = interaction.guild.id
        if (!await serverindb(serverid)) {
            await registerserver(serverid)
        }

        await execute(db, "UPDATE serverconfig SET ai_channel_id=? WHERE server_id=?", [channel.id, serverid])
        const data = await queryall(db, "SELECT * FROM serverconfig")
        const ai_channel_id = data.map(item => item["ai_channel_id"])
        setAiIds(ai_channel_id)
        interaction.reply("Changed the AI bot channel!")
    }
}