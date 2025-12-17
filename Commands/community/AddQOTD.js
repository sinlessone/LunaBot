const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { execute, queryone, db, exists } = require('../../utils/db');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addqotd')
        .setDescription('Add a new QOTD (Question of the Day)')
        .addStringOption(option => option
            .setName('question')
            .setDescription('The question to add')
            .setMaxLength(300)
            .setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const question = interaction.options.getString('question');

        await execute(db, "INSERT INTO qotd (question) VALUES ( ?)", [question]);
        await interaction.reply(`QOTD added successfully!`);
    }
}