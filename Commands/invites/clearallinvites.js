const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearallinvites")
        .setDescription("Clear all the invites in the server (won't count towards /invites)"),
    modOnly: true,
    cooldown: 60,
    async execute(interaction) {
        try {
            await execute(db, "UPDATE invites SET validInvite=0 WHERE serverId=?", [interaction.guild.id])
            return interaction.reply({
                embeds: [presets.success("SUCCESS", "Successfully reset all user invites in this server")]
            })
        } catch (e) {
            console.log(e)
            return interaction.reply({
                embeds: [presets.error("ERROR", "Something went wrong while resetting server invites, try again later or contact the bot owner")]
            })
        }
    }
}