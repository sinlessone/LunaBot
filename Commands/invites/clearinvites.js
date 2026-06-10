const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearinvites")
        .setDescription("Clear all invites for a specific user (won't count towards /invites)")
        .addUserOption(option => option
            .setName("user")
            .setDescription("who's invites to clear")
            .setRequired(true)
        ),
    modOnly: true,
    cooldown: 60,
    async execute(interaction) {
        const target = await interaction.options.getMember("user")
        if (!target) {
            return await interaction.reply({
                embeds: [presets.error("ERROR", "the specified user is not in the server")]
            })
        }

        try {
            await execute(db, "UPDATE invites SET validInvite=0 WHERE serverId=? AND inviterId=?", [interaction.guild.id, target.id])
            return interaction.reply({
                embeds: [presets.success("SUCCESS", `Successfully reset all <@${target.id}>'s user invites`)]
            })
        } catch (e) {
            console.log(e)
            return interaction.reply({
                embeds: [presets.error("ERROR", "Something went wrong while resetting user invites, try again later or contact the bot owner")]
            })
        }
    }
}