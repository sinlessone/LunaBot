const {SlashCommandBuilder} = require("discord.js");
const {serverindb, registerserver, execute, db, queryall} = require("../../utils/db");
const {setCountIds} = require("../../utils/setcountingids");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("setcountingnumber")
        .setDescription("sets the current counting number")
        .addNumberOption(option => option
            .setName("number")
            .setDescription("The number to set last number to")
            .setRequired(true)
        ),
    adminOnly: true,
    async execute(interaction) {

        const number = Math.round(await interaction.options.getNumber("number"))
        if (number < 0) {
            return interaction.reply("please enter a positive number")
        }
        const serverid = interaction.guild.id
        if (!await serverindb(serverid)) {
            await registerserver(serverid)
        }

        await execute(db, "UPDATE serverconfig SET current_number=? WHERE server_id=?", [number, serverid])
        const data = await queryall(db, "SELECT * FROM serverconfig")
        const counting_channel_id = data.map(item => item["counting_channel_id"])
        setCountIds(counting_channel_id)
        interaction.reply(`Successfully set the counting number to ${number}`)

    }
}