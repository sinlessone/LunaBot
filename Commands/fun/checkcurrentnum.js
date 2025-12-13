const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db, serverindb, registerserver} = require('../../utils/db')
const config = require('../../config.json')
const {setAiIds, getAiIds} = require("../../utils/setaiids");
const {forEach} = require("mathjs");
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checknum")
        .setDescription("returns the current counting number"),
    cooldown: 10,
    async execute(interaction) {
        const { current_number: lastnumber, altered_count: qualified} = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=?", [interaction.guild.id])
        let embed = presets.info(`Current number: **${Number(lastnumber) + 1}**`, `*Is server qualified for leaderboard*: ${qualified === 0 ? "✅" : "❌"}`)

        await interaction.reply({
            embeds: [embed]
        })
    }
}