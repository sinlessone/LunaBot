const {SlashCommandBuilder} = require("discord.js");
const {serverindb, registerserver, execute, db, queryall} = require("../../utils/db");
const {setCountIds} = require("../../utils/setcountingids");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupcounting")
        .setDescription("Sets a channel for counting")
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("The channel to watch counting in")
            .setRequired(true)
        ),
    adminOnly: true,
    async execute(interaction) {

        const channel = interaction.options.getChannel("channel");
        const serverid = interaction.guild.id
        if (!await serverindb(serverid)) {
            await registerserver(serverid)
        }

        await execute(db, "UPDATE serverconfig SET counting_channel_id=? WHERE server_id=?", [channel.id, serverid])
        const data = await queryall(db, "SELECT * FROM serverconfig")
        const counting_channel_id = data.map(item => item["counting_channel_id"])
        setCountIds(counting_channel_id)
        interaction.reply("Changed the counting channel!")

    }
}