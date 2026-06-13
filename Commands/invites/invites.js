const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");
const {getInvitesCount} = require("../../utils/getinvitecount");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invites")
        .setDescription("see how many invites a user has")
        .addUserOption(option => option
            .setName("user")
            .setDescription("who to look up")
        ),
    cooldown: 5,
    async execute(interaction) {
        const target = await interaction.options.getMember("user")?.id || interaction.user.id
        if (!target) {
            return await interaction.reply({
                embeds: [presets.error("ERROR", "the specified user is not in the server")]
            })
        }

        const invites = await getInvitesCount(interaction, target)

        await interaction.reply({
            embeds: [presets.success("SUCCESS", `<@${target}> has ${invites} invites`)]
        })
    }
}