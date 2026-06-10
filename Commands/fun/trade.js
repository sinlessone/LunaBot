const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags} = require('discord.js')
const { exists, execute, queryone, queryall, db} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Trade your money with someone!')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Who to trade with')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('amount')
            .setDescription('how much to give')
            .setRequired(true)
        ),
    cooldown: 10,
    async execute (interaction) {
        const target = interaction.options.getUser('user') || interaction.user
        const input = interaction.options.getString('amount')
        if (isNaN(input)) {
            return await interaction.reply({
                content: 'Please enter a valid number.',
                flags: MessageFlags.Ephemeral
            })
        }
        const amount = Math.round(Number(input))
        const userexists = await exists(db, interaction.user.id)
        const targetexists = await exists(db, target.id)
        if (!userexists) {
            return interaction.reply({
                embeds: [
                    presets.error('❌ Registration Required', 'You are not registered. Use **/register** to get started.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }
        if (interaction.user.id === target.id) {
            return interaction.reply({
                content: `You can't trade your self silly!`,
                flags: MessageFlags.Ephemeral
            })
        }
        if (!targetexists) {
            return interaction.reply({
                content: `This user isnt registered, Tell them to register using /register`,
                flags: MessageFlags.Ephemeral
            })
        }
        const {balance: sbalance} = await queryone(db, "SELECT balance FROM users WHERE user_id=?", [interaction.user.id])
        const {balance: rbalance} = await queryone(db, "SELECT balance FROM users WHERE user_id=?", [target.id])
        if (amount < 0) {
            return interaction.reply({
                content: `Are you trying to steal or something? Denied.`,
                flags: MessageFlags.Ephemeral
            })
        }
        if (sbalance < amount) {
            return interaction.reply({
                flags: MessageFlags.Ephemeral
            })
        }
        const snbalance = sbalance - amount
        const rnbalance = rbalance + amount
        await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [snbalance, interaction.user.id]) // take money from sender
        await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [rnbalance, target.id]) // give money to receiver
        await interaction.reply({
            content: `Gave ${amount}$ to <@${target.id}>`
        })
    }
}