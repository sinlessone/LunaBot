const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db, serverindb, registerserver} = require('../../utils/db')
const config = require('../../config.json')
const {setAiIds, getAiIds} = require("../../utils/setaiids");
const {forEach} = require("mathjs");
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("view the counting leaderboards"),
    cooldown: 10,
        // likely a very poor way of doing it but meh no one uses this bot so
    async execute(interaction) {
        let data = await queryall(db, "SELECT current_number, server_id FROM serverconfig WHERE altered_count=? ORDER BY CAST(current_number AS INTEGER) DESC LIMIT 10", [0])
        let leaderboard = presets.info("TOP #10 COUNTERS")
        let i = 1
        for (const dataObject of data) {
            const guild = await interaction.client.guilds.fetch(dataObject["server_id"])
            leaderboard.addFields({
                name: `**#${i}** ${guild.name}: **${dataObject["current_number"]}**`,
                value: ""
            }
            )
            i++
        }
        await interaction.reply({
            embeds: [leaderboard]
        })
    }
}