const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { execute, queryone, db, exists } = require('../../utils/db');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sendqotd")
        .setDescription("Send a random qotd"),
    async execute(interaction) {
        const qotd = await queryone(db, "SELECT * FROM qotd WHERE used=? ORDER BY RANDOM() LIMIT 1", ["false"])
        if (qotd) {
            await execute(db, "UPDATE qotd SET used=? WHERE question=?", ["true", qotd.question]);
            await interaction.reply(qotd["question"])
        } else {
            await interaction.reply("No qotds found, please add some and try again.");
        }
    }
}