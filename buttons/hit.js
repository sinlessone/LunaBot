const {calculateScore} = require("../utils/calculateScore");
const {presets} = require("../data/embed");
const {MessageFlags} = require('discord.js')
const {wait} = require("../utils/wait");
const {execute, db, queryone} = require("../utils/db");
module.exports = {
    data: {
        name: "hit"
    },
    async execute(interaction) {
        const { client } = interaction
        const gameState = client.blackjackGames.get(interaction.user.id)
        if (!gameState) {
            return interaction.reply({
                embeds: [presets.warning("You do not have any games running")],
                flags: MessageFlags.Ephemeral
            })
        }

        if (gameState.messageId !== interaction.message.id) {
            return interaction.reply({
                embeds: [presets.warning("This is not your game")],
                flags: MessageFlags.Ephemeral
            })
        }

        const playerHand = gameState.playerHand
        playerHand.push(gameState.deck.pop())
        let playerScore = calculateScore(gameState.playerHand)
        let dealerScore = calculateScore(gameState.dealerHand)
        if (playerScore > 21) {
            await interaction.update({
                embeds: [presets.error("BUST", `Your Score: ${playerScore}\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)} \nDealer's hand: ${gameState.dealerHand.map(h => `${h.rank}${h.suit}`)}\nDealer's score: ${dealerScore}`)],
                components: []
            })
            return client.blackjackGames.delete(interaction.user.id)
        }
        if (playerScore === 21) {
            await interaction.deferUpdate();
            await interaction.editReply({
                embeds: [presets.success("Standing..", `Your Score: ${playerScore}\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)} \nDealer's score: ${dealerScore}\nDealer's hand: ${gameState.dealerHand.map(h => `${h.rank}${h.suit}`)}`)],
                components: []
            })
            const {balance} = await queryone(db, "SELECT balance FROM users WHERE user_id=?", [interaction.user.id])

            while (dealerScore < 17) {
                gameState.dealerHand.push(gameState.deck.pop())
                dealerScore = calculateScore(gameState.dealerHand)
                await wait(1200)
                await interaction.editReply({
                    embeds: [presets.success("Dealer shuffling..", `Your Score: ${playerScore}\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)} \nDealer's score: ${dealerScore}\nDealer's hand: ${gameState.dealerHand.map(h => `${h.rank}${h.suit}`)}`)],
                })
            }
            client.blackjackGames.delete(interaction.user.id)
            if (dealerScore > 21) {
                await interaction.editReply({
                    embeds: [presets.success("BUST", `Dealer busted, you won!\nYour score: ${playerScore}\nDealer's score: ${dealerScore}`)]
                })
                return await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Number(balance) + gameState.bet * 2, interaction.user.id])

            }
            if (dealerScore < playerScore) {
                await interaction.editReply({
                    embeds: [presets.success("WIN", `Player has a higher score, you won!\nYour score: ${playerScore}\nDealer's score: ${dealerScore}`)]
                })
                return await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Number(balance) + gameState.bet * 2, interaction.user.id])
            }
            if (dealerScore > playerScore) {
                return await interaction.editReply({
                    embeds: [presets.error("LOSS", `Dealer has a higher score, you lost..\nYour score: ${playerScore}\nDealer's score: ${dealerScore}`)]
                })
            }
            if (dealerScore === playerScore) {
                await interaction.editReply({
                    embeds: [presets.info("TIE", `Dealer tied the score with the player, you tied!\nYour score: ${playerScore}\nDealer's score: ${dealerScore}`)]
                })
                return await execute(db, "UPDATE users SET balance=? WHERE user_id=?", [Number(balance) + gameState.bet, interaction.user.id])
            }
        }

        await interaction.update({
            embeds: [presets.success("SUCCESS", `Your Score: ${playerScore}\nYour hand: ${gameState.playerHand.map(h => `${h.rank}${h.suit}`)} \nDealer's hand: ${gameState.dealerHand[0].rank + gameState.dealerHand[0].suit}, ??`)],
        })
    }
}