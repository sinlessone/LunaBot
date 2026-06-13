const { execute, db, queryone } = require("../utils/db");
const { presets } = require('../data/embed');
const { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getInvitesCount } = require("../utils/getinvitecount");

module.exports = {
    data: {
        name: "joingiveaway"
    },
    async execute(interaction) {
        try {
            const message = interaction.message;

            const giveaway = await queryone(db, "SELECT * FROM giveaways WHERE messageId=? AND serverId=?", [message.id, interaction.guild.id]);

            if (!giveaway || giveaway.isDone) {
                return await interaction.reply({ content: "This giveaway no longer exists or has ended.", flags: MessageFlags.Ephemeral });
            }

            await interaction.deferUpdate();

            if (giveaway.invites > 0) {
                const userInvites = await getInvitesCount(interaction, interaction.user.id);
                if (giveaway.invites > userInvites) {
                    return await interaction.followUp({
                        embeds: [presets.warning("INSUFFICIENT INVITES", "You do not have enough invites to join this giveaway. Use /invites to check your balance.")],
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            const useringw = await queryone(db, "SELECT 1 FROM entries WHERE messageId=? AND userId=? AND guildId=?", [message.id, interaction.user.id, interaction.guild.id]);

            if (!useringw) {
                await execute(db, "INSERT INTO entries(messageId, guildId, userId) VALUES(?, ?, ?)", [message.id, interaction.guild.id, interaction.user.id]);
            } else {
                await execute(db, "DELETE FROM entries WHERE messageId=? AND guildId=? AND userId=?", [message.id, interaction.guild.id, interaction.user.id]);
            }

            const countResult = await queryone(db, "SELECT COUNT(*) as total FROM entries WHERE messageId=?", [message.id]);
            const totalParticipants = countResult ? countResult.total : 0;

            const button = new ButtonBuilder()
                .setEmoji("🎉")
                .setLabel(String(totalParticipants))
                .setCustomId("joingiveaway")
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.editReply({
                components: [row]
            });

        } catch (e) {
            console.error("Error in joingiveaway handler:", e);
        }
    }
};