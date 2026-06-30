const {SlashCommandBuilder} = require("discord.js");
const {presets} = require("../../data/embed");
const {execute, db, queryone} = require("../../utils/db");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('honeypot')
        .setDescription("Setup a channel for auto banning users")
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('the honey pot channel')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('action')
            .setDescription("whether to softban or ban the user (defaults to softban)")
            .addChoices(
                {name: "Ban", value: "1"},
                {name: "Softban", value: "0"}
            )
        ),
    administrator: true,
    async execute(interaction) {
        const channel = interaction.options.getChannel("channel")
        const softbanorban = interaction.options.getString("action") || 0
        try {
            const { honeypot } = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=$1", [interaction.guild.id])
            const message = await channel.send({
                embeds: [presets.warning("WARNING", "DO NOT SEND MESSAGES HERE\nAnyone who sends a message here WILL be instantly banned")],
                fetchReply: true
            })
            await execute(db, "INSERT INTO serverconfig (server_id, honeypot, honeypotmessage, softbanorban) VALUES ($1, $2, $3, $4) ON CONFLICT (server_id) DO UPDATE SET honeypot = excluded.honeypot, honeypotmessage = excluded.honeypotmessage, softbanorban=excluded.softbanorban", [interaction.guild.id, channel.id, message.id, softbanorban])
            await interaction.reply({
                embeds: [presets.success("SUCCESS", "Successfully set honey pot channel to that channel")],
                ephemeral: true,
            })
        } catch (e) {
            console.error(e)
            await interaction.reply({
                embeds: [presets.error("ERROR", "An unhandled error has occurred.")],
                ephemeral: true,
            })
        }

    }
}