const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { execute, queryone, queryall, db, exists} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription(`Get your or someone else's balance`)
        .addUserOption(option => option
            .setName('user')
            .setDescription(`Who's balance to check`)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user') ?? interaction.user
        const exist = await exists(db, target.id)
        if (!exist) {
            return interaction.reply({
                embeds: [
                    presets.error('❌ Registration Required', 'You are not registered. Use **/register** to get started.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }
        const userData = await queryone(db, "SELECT balance FROM users WHERE user_id=?", [`${target.id}`])
        await interaction.reply({
            embeds: [presets.success("SUCCESS", `<@${target.id}>'s balance is ${Number(userData["balance"])}$`)]
        })
    }
}