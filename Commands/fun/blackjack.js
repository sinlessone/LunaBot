const { EmbedBuilder, SlashCommandBuilder, resolveColor, ButtonStyle, MessageFlags, ActionRowBuilder, ButtonBuilder} = require('discord.js')
const { execute, queryone, queryall, db, exists} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");
const {shuffleDeck} = require("../../utils/shuffleDeck");
const {createDeck} = require("../../utils/createDeck");
const {calculateScore} = require("../../utils/calculateScore");
const {wait} = require("../../utils/wait");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Play a game of blackjack!")
        .addIntegerOption(option => option
            .setName("amount")
            .setDescription("How much do you want to bet")
            .setMinValue(1)
            .setRequired(true)
        ),
    cooldown: 10,
    async execute(interaction) {
        const amount = interaction.options.getInteger("amount")

        if (!await exists(db, interaction.user.id)) {
            return interaction.reply({
                embeds: [
                    presets.error('❌ Registration Required', 'You are not registered. Use **/register** to get started.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }
        const { client } = interaction;

        if (client.blackjackGames.has(interaction.user.id)) {
            return interaction.reply({
                embeds: [presets.warning("ERROR", "You already having a bj game running")]
            })
        }

        const { balance } = await queryone(db, "SELECT balance FROM users WHERE user_id=?", [interaction.user.id])

        if (balance < amount) {
            return await interaction.reply({
                embeds: [presets.warning("BROKE", "You made a bet bigger than you can afford, and the casino staff threw you out")]
            })
        }



        const gameState = {
            deck: shuffleDeck(createDeck()),
            playerHand: [],
            dealerHand: [],
            bet: amount,
            messageId: "",
        };


        gameState.playerHand.push(gameState.deck.pop(), gameState.deck.pop());

        gameState.dealerHand.push(gameState.deck.pop(), gameState.deck.pop());

        const playerScore = calculateScore(gameState.playerHand);
        const dealerScore = calculateScore(gameState.dealerHand);

        await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Number(balance)-amount, interaction.user.id])



        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('hit').setLabel('Hit').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('stand').setLabel('Stand').setStyle(ButtonStyle.Secondary),
            );

        if (playerScore === 21 && dealerScore !== 21) {
            await interaction.reply({
                embeds: [presets.success("BLACKJACK", `You hit a natural blackjack and won!\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)}\nYour score: ${playerScore}\nDealer's hand: ${gameState.dealerHand.map(h => `${h.rank}${h.suit}`)}\nDealer's score: ${dealerScore}`)],
                components: []
            })
            return await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Number(balance)+Math.round(amount*1.5), interaction.user.id])
        }
        if (playerScore !== 21 && dealerScore === 21) {
            return await interaction.reply({
                embeds: [presets.error("BLACKJACK", `The dealer hit a natural blackjack and you lost..\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)}\nYour score: ${playerScore}\nDealer's hand: ${gameState.dealerHand.map(h => `${h.rank}${h.suit}`)}\nDealer's score: ${dealerScore}`)],
                components: []
            })

        }
        if (playerScore === 21 && dealerScore === 21) {
            await interaction.reply({
                embeds: [presets.info("BLACKJACK", `Both you and the dealer hit a natural blackjack and tied!\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)}\nYour score: ${playerScore}\nDealer's hand: ${gameState.dealerHand.map(h => `${h.rank}${h.suit}`)}\nDealer's score: ${dealerScore}`)],
                components: []
            })
            return await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Number(balance), interaction.user.id])

        }
        await interaction.reply({
            embeds: [presets.success("SUCCESS", `Your Score: ${playerScore}\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)} \nDealer's hand: ${gameState.dealerHand[0].rank + gameState.dealerHand[0].suit}, ??`)],
            components: [row],
            fetchReply: true
        }).then(m => {
            gameState.messageId = m.id
        })
        client.blackjackGames.set(interaction.user.id, gameState);
    }
}