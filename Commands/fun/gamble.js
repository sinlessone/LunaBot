const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { execute, queryone, queryall, db, exists} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Take a chance with the devil!')
        .addStringOption(option => option
            .setName('amount')
            .setDescription('How much can you afford to lose?')
            .setRequired(true)
        ),
    cooldown: 3,
    async execute(interaction) {
        const exist = await exists(db, interaction.user.id)
        if (!exist) {
            return interaction.reply({
                embeds: [
                    presets.error('❌ Registration Required', 'You are not registered. Use **/register** to get started.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }
        const input = interaction.options.getString('amount')
        if (isNaN(input)) {
            return await interaction.reply({
                content: 'Please enter a valid number.',
                flags: MessageFlags.Ephemeral
            })
        }
        const amount = Math.round(Number(input))
        if (amount < 0) {
            return await interaction.reply(`The devil doesn't deal with such amounts.. Not in this world at least.`)
        }
        const userData = await queryone(db, "SELECT * FROM users WHERE user_id=?", [`${interaction.user.id}`])
        let balance = Number(userData["balance"])
        if (balance < amount) {
            return await interaction.reply(`Do not offer what you cannot afford.`)
        }
        balance = balance - amount
        const win = Math.random() < 1/3
        let Nbalance;
        if (win) {
            Nbalance = balance + (amount * 2)
            await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Nbalance, interaction.user.id])
            return await interaction.reply(`You won ${amount * 2}$! Your new balance is ${Nbalance}$.`)
        } else {
            const Nbalance = balance
            await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Nbalance, interaction.user.id])
            await interaction.reply(`You've sadly lost.. Your new balance is ${Nbalance}`)
        }
    }
}