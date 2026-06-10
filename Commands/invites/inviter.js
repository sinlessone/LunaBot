const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inviter")
        .setDescription("see who invited a user")
        .addUserOption(option => option
            .setName("user")
            .setDescription("who to look up")
            .setRequired(true)
        ),
    modOnly: true,
    async execute(interaction) {
        const target = await interaction.options.getMember("user")
        if (!target) {
            return await interaction.reply({
                embeds: [presets.error("ERROR", "the specified user is not in the server")]
            })
        }

        const { inviterId, inviteCode } = await queryone(db, "SELECT * FROM invites WHERE invitedId=? AND serverId=?", [target.id, interaction.guild.id]) || ""
        if (!inviterId) {
            return await interaction.reply({
                embeds: [presets.warning("FAILURE", "No inviter data (Maybe invited using vanity / other methods?)")]
            })
        }
        await interaction.reply({
            embeds: [presets.success("SUCCESS", `<@${target.id}> was invited by <@${inviterId}> using code: https://discord.gg/${inviteCode}`)]
        })
    }
}