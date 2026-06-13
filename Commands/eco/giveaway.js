const { EmbedBuilder, SlashCommandBuilder, resolveColor, MessageFlags, time, TimestampStyles, ButtonBuilder,
    ButtonStyle, ActionRowBuilder
} = require('discord.js')
const { exists, execute, queryone, queryall, db} = require('../../utils/db')
const config = require('../../config.json')
const {presets} = require("../../data/embed");
const {parseTimeToMs} = require("../../utils/parseTime");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("start a giveaway!")
        .addStringOption(option => option
            .setName("prize")
            .setDescription("What will the winners get")
            .setRequired(true)
            .setMaxLength(60)
        )
        .addStringOption(option => option
            .setName("duration")
            .setDescription("anywhere from 1 minute to 30 days, hours if no suffix, usage: 1m, 1h, 1h, 1w")
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName("winners")
            .setDescription("How many winners should be picked, defaults to one")
            .setMinValue(1)
            .setMaxValue(20)
        )
        .addIntegerOption(option => option
            .setName("invites")
            .setDescription("How many invites are needed to join, defaults to none")
            .setMinValue(0)
        ),
    modOnly: true,
    async execute(interaction) {
        let message;
        try {
            const prize = interaction.options.getString("prize")
            const duration = interaction.options.getString("duration")
            const winners = interaction.options.getInteger("winners") || 1
            const invites = interaction.options.getInteger("invites") || 0

            const timeLeft = parseTimeToMs(duration)
            if (!timeLeft) {/* user put in a bad time format, tell him*/
            }
            if (timeLeft > 30 * 24 * 60 * 60 * 1000) {/* time's more than 30 days, inform the user*/
            }
            const endTime = Date.now() + timeLeft
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji("🎉")
                        .setLabel("0")
                        .setCustomId("joingiveaway")
                        .setStyle(ButtonStyle.Primary)
                )
            let description = `Prize: ${prize}\nEnds in: ${time(Math.floor(endTime / 1000), TimestampStyles.RelativeTime)}\nWinners: ${winners}`
            if (invites) description = description + `\nInvites needed: ${invites}`
            message = await interaction.reply({
                embeds: [presets.success("GIVEAWAY", description)],
                fetchReply: true,
                components: [row]
            });
            await execute(db, "INSERT INTO giveaways(messageId, channelId, serverId, isDone, endsAt, hostId, winnerCount, prize, invites) VALUES(?, ?, ?, 0, ?, ?, ?, ?, ?)", [message.id, interaction.channel.id, interaction.guild.id, endTime, interaction.user.id, winners, prize, invites])
        } catch(e) {
            console.error("Failed to create giveaway:", e);

            if (message) {
                try {
                    await interaction.deleteReply();
                } catch (deleteError) {
                    console.error("Failed to delete orphaned giveaway message:", deleteError);
                }
            }

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "An error occurred while setting up the giveaway.", flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content: "An error occurred while setting up the giveaway.", flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
    }
}