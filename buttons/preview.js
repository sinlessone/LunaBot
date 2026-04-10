    const {execute, db, queryone} = require("../utils/db");
    const { createEmbed, presets } = require('../data/embed');
    const config = require('../config.json')
    const {resolveColor, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
        ButtonBuilder,
        ButtonStyle, PermissionsBitField
    } = require("discord.js");
module.exports = {
    data: {
        name: "preview"
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "wow! you clicked the preview button",
                flags: MessageFlags.Ephemeral
            })
        }
        const channelId = interaction.message.channel.id
        const { deniedChannelId, acceptedChannelId} = await queryone(db, "SELECT * FROM serverconfig WHERE suggestionChannelId=? AND server_id=?", [channelId, interaction.guild.id])
        const { suggestion, suggesterId, upvotes, downvotes, suggestionId } = await queryone(db, "SELECT * FROM suggestions WHERE suggestionMessageId=? AND serverId=?", [interaction.message.id, interaction.guild.id])


        const suggester = await interaction.client.users.fetch(suggesterId).catch(() => null)


        let suggesterAvatar = suggester.user.displayAvatarURL({ size: 128}) ?? suggester.user.defaultAvatarURL

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(String(upvotes))
                    .setCustomId("upvote")
                    .setEmoji("👍")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel(String(upvotes-downvotes))
                    .setCustomId("preview")
                    .setEmoji("#️⃣")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(String(downvotes))
                    .setCustomId("downvote")
                    .setDisabled(true)
                    .setEmoji("👎")
                    .setStyle(ButtonStyle.Danger)
            )

        const acceptChannel = interaction.guild.channels.cache.get(acceptedChannelId)
        const denyChannel = interaction.guild.channels.cache.get(deniedChannelId)


        const modal = new ModalBuilder({
            customId: `judgesuggestion-${suggestionId}`,
            title: "Judge Suggestion"
        });

        const denyAccept = new TextInputBuilder({
            customId: "judgement",
            label: "Deny or Accept (d/a)",
            required: true,
            style: TextInputStyle.Short
        });

        const reasonBuilder = new TextInputBuilder({
            customId: "reason",
            label: "Reason for accepting / denying",
            required: false,
            style: TextInputStyle.Short
        })


        const FirstActionRow = new ActionRowBuilder().addComponents(denyAccept)
        const SecondActionRow = new ActionRowBuilder().addComponents(reasonBuilder)

        modal.addComponents(FirstActionRow, SecondActionRow)



        await interaction.showModal(modal)


        const filter = (i) => i.customId === `judgesuggestion-${suggestionId}`


        try {
            const modalInteraction = await interaction.awaitModalSubmit({
                filter: i =>
                    i.customId === `judgesuggestion-${suggestionId}` &&
                    i.user.id === interaction.user.id,
                time: 240_000,
            });



            const result = modalInteraction.fields.getTextInputValue("judgement");
            const reason =
                modalInteraction.fields.getTextInputValue("reason") || "No reason provided";
            await modalInteraction.deferUpdate();

            if (["d", "deny", "den", "de"].includes(result.toLowerCase())) {
                await execute(
                    db,
                    "UPDATE suggestions SET denied=? WHERE suggestionMessageId=? AND serverId=?",
                    [1, interaction.message.id, interaction.guild.id]
                );
                await denyChannel.send({
                    embeds: [
                        presets
                            .error("", suggestion)
                            .setFooter({ text: `(ID: ${suggestionId})` })
                            .setAuthor({
                                name: `Suggestion | ${suggester.user.username}`,
                                iconURL: suggesterAvatar
                            })
                            .addFields({
                                name: `Denied by ${interaction.user.username}`,
                                value: reason
                            })
                    ],
                    components: [row]
                });
                await modalInteraction.deferUpdate();
                await interaction.message.delete();
            } else if (
                ["a", "ac", "acc", "acce", "accep", "accept"].includes(result.toLowerCase())
            ) {
                await execute(
                    db,
                    "UPDATE suggestions SET accepted=? WHERE suggestionMessageId=? AND serverId=?",
                    [1, interaction.message.id, interaction.guild.id]
                );
                await acceptChannel.send({
                    embeds: [
                        presets
                            .success("", suggestion)
                            .setFooter({ text: `(ID: ${suggestionId})` })
                            .setAuthor({
                                name: `Suggestion | ${suggester.user.username}`,
                                iconURL: suggesterAvatar
                            })
                            .addFields({
                                name: `Accepted by ${interaction.user.username}`,
                                value: reason
                            })
                    ],
                    components: [row]
                });
                await interaction.message.delete();
            } else {
                await modalInteraction.followUp({
                    content: "Please either reply with accept or deny.",
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (e) {
            if (e.code === 40060) return
            if (e.code === 10062) return
            console.log(e)
        }


    }

}