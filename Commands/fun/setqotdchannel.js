const {SlashCommandBuilder} = require("discord.js");
const {serverindb, registerserver, execute, db, queryall} = require("../../utils/db");
const {setCountIds} = require("../../utils/setcountingids");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupqotd")
        .setDescription("Sets a channel for questions of the day")
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("The channel to set qotd messages to be sent in")
            .setRequired(true)
        ),
    adminOnly: true,
    async execute(interaction) {

        const channel = interaction.options.getChannel("channel");
        const serverid = interaction.guild.id
        if (!await serverindb(serverid)) {
            await registerserver(serverid)
        }

        await execute(db, "UPDATE serverconfig SET qotd_channel=?, qotd_enabled=1 WHERE server_id=?", [channel.id, serverid])
        interaction.reply("Changed the qotd channel!")

    }
}