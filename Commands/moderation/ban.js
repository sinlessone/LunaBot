const {SlashCommandBuilder, EmbedBuilder, resolveColor, MessageFlags} = require('discord.js')
const {IsBanned} = require("../../utils/IsBanned");
const config = require('../../config.json')
const {dmUser} = require("../../utils/dmUser");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from this guild')
        .addUserOption(option => option
                .setName('user')
                .setDescription('User to ban')
                .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Reason to ban this member')
            .setMaxLength(480)
        )
        .addNumberOption(option => option
            .setName('duration')
            .setDescription('Duration in hours for messages to delete')
            .setMaxValue(168)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user')
        const member = interaction.options.getMember('user')
        const reason = interaction.options.getString('reason') ?? 'No reason given'
        const durationInput = interaction.options.getNumber('duration');
        const duration = durationInput ? durationInput * 60 * 60 : 0;
        const banned = await IsBanned(interaction, user.id)
        const embed = new EmbedBuilder()
            .setFooter({
                text: config.footer,
                iconURL: config.footerUrl
            })
            .setTimestamp(new Date())
        if (banned) {

            return interaction.reply({
                embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription(`<@${user.id}> is already banned`)],
                flags: MessageFlags.Ephemeral
            })

        }

        if (member) {
            if (!interaction.member.permissions.has("BanMembers")) {

                return interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription('You do not have permissions to ban members')],
                    flags: MessageFlags.Ephemeral
                })

            }

            if (!interaction.guild.members.me.permissions.has('BanMembers')) {

                return interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription('I do not have permission to ban members')],
                    flags: MessageFlags.Ephemeral
                })

            }

            if (interaction.member.id === user.id) {

                return interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription('You cannot ban your self, silly!')],
                    flags: MessageFlags.Ephemeral
                })
            }


            if (user.id === interaction.client.user.id) {

                return interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription('I refuse to ban my self')],
                    flags: MessageFlags.Ephemeral
                })
            }

            if (!member.bannable) {

                return interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription('I do not have permissions to ban this member (possibly higher role?)')],
                    flags: MessageFlags.Ephemeral
                })

            }

            if (interaction.member.roles.highest.position <= member.roles.highest.position && member.id !== interaction.guild.ownerId) {
                return interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setDescription("You do not have permissions to ban this member")],
                    flags: MessageFlags.Ephemeral
                })
            }

            try {
                let success;
                try {
                    success = await dmUser(interaction, member, `You have been banned with reason: ${reason}`)
                } catch (e) {}

                await interaction.guild.members.ban(user.id, {
                    deleteMessageSeconds: duration,
                    reason: `${reason} - by <@${interaction.user.id}>`
                });
                console.log(success)
                await interaction.reply({
                    embeds: [embed.setColor(resolveColor("Green")).setTitle("SUCCESS").setDescription(`Banned user <@${user.id}> (${user.id})`).addFields({
                        name: "Direct messaged?", value: success ? "✅" : "❌"
                    })]
                });
            } catch (error) {
                await interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setTitle("ERROR").setDescription(`Failed to ban user: ${error.message}`)],
                    flags: MessageFlags.Ephemeral
                });
            }
        } else {

            try {
                if (!interaction.member.permissions.has("BanMembers")) {

                    return interaction.reply({
                        embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription('You do not have permissions to ban members')],
                        flags: MessageFlags.Ephemeral
                    })

                }

                if (!interaction.guild.members.me.permissions.has('BanMembers')) {

                    return interaction.reply({
                        embeds: [embed.setColor(resolveColor("Red")).setTitle('ERROR').setDescription('I do not have permission to ban members')],
                        flags: MessageFlags.Ephemeral
                    })

                }

                await interaction.guild.members.ban(user.id, {
                    deleteMessageSeconds: duration,
                    reason: `${reason} - by <@${interaction.user.id}>`
                });

                await interaction.reply({
                    embeds: [embed.setColor(resolveColor("Green")).setTitle("SUCCESS").setDescription(`Banned user <@${user.id}> (${user.id})`)]
                });
            } catch (error) {
                await interaction.reply({
                    embeds: [embed.setColor(resolveColor("Red")).setTitle("ERROR").setDescription(`Couldn't to ban user: ${error.message}`)],
                    flags: MessageFlags.Ephemeral
                });
            }

        }
    }
}