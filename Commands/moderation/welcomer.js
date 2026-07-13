const {SlashCommandBuilder} = require('discord.js')
const {presets} = require("../../data/embed");
const {execute, db} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcomer')
        .setDescription('Automatically sends welcome messages for new members')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription("The channel to send welcome messages to")
            .setRequired(true)
        ),
    adminOnly: true,
    cooldown: 5,

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel')
        if (channel.type !== 0) {
            return  await interaction.reply({
                embeds: [presets.error("Invalid channel", "Please provide a text channel")],
            })
        }
            try {
            await execute(db, "UPDATE serverconfig SET joinchannelid=$1 WHERE server_id=$2", [channel.id, interaction.guild.id]);
            await interaction.reply({
                embeds: [presets.success("Success", `Welcome messages will be sent to <#${channel.id}>`)],
            })
            } catch (e) {
                console.error(e);
            }

    }
}