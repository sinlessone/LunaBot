const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");

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
        const target = await interaction.options.getMember("user").id || interaction.user.id
        if (!target) {
            return await interaction.reply({
                embeds: [presets.error("ERROR", "the specified user is not in the server")]
            })
        }

        const data = await queryall(db, "SELECT * FROM invites WHERE inviterId=? AND serverId=? AND validInvite=1", [target, interaction.guild.id]) || ""

        await interaction.reply({
            embeds: [presets.success("SUCCESS", `<@${target}> has ${data.length} invites`)]
        })
    }
}