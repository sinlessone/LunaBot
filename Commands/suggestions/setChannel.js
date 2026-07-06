const {  SlashCommandBuilder} = require('discord.js')
const { execute, queryone, queryall, db} = require('../../utils/db')
const {setSuggestIds} = require("../../utils/setsuggestids");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setsuggestionchannel")
        .setDescription("sets channels for suggestions")
        .addChannelOption(option => option
            .setName("suggestions")
            .setDescription("the channel to create suggestions from")
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName("accepted")
            .setDescription("the channel to send accepted suggestions to")
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName("denied")
            .setDescription("the channel to send denied suggestions to")
            .setRequired(true)
        )
        .addBooleanOption(option => option
            .setName("auto_thread")
            .setDescription("whether to auto create threads for suggestions or not (defaults to true)")
        ),
    ownerOnly: true,
    async execute(interaction) {
        const suggestionChannel = await interaction.options.getChannel("suggestions")
        const acceptedChannel = await interaction.options.getChannel("accepted")
        const deniedChannel = await interaction.options.getChannel("denied")
        const autoThread = await interaction.options.getBoolean("auth_thread") || true
        const exists = await queryone(db, "SELECT suggestionChannelId FROM serverconfig WHERE server_id=?", [interaction.guild.id])
        if (exists) {
            await execute(db, "UPDATE serverconfig SET suggestionChannelId=?, acceptedChannelId=?, deniedChannelId=?, autothread=? WHERE server_id=?", [suggestionChannel.id, acceptedChannel.id, deniedChannel.id, +autoThread, interaction.guild.id] )
        } else {
            await execute(db, "INSERT INTO serverconfig(server_id, suggestionChannelId, deniedChannelId, acceptedChannelId, autothread) VALUES (?, ?, ?, ?, ?)", [interaction.guild.id, suggestionChannel.id, deniedChannel.id, acceptedChannel.id, +autoThread])
        }
        const newSuggestData = await queryall(db, "SELECT * FROM serverconfig")
        const newSuggestIds = newSuggestData.map(filter => filter.suggestionchannelid)
        setSuggestIds(newSuggestIds)

        interaction.reply("successfully setup suggestions for this server")
    }

}