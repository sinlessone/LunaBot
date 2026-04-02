const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const { presets } = require("../../data/embed");
const {execute, db, queryone, queryall} = require("../../utils/db");
const {setreactids} = require("../../utils/setreactions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Manage reaction roles')
        .addSubcommand(command => command
            .setName('add')
            .setDescription("Add a reaction role to a message")
            .addStringOption(option => option
                .setName('messageid')
                .setDescription('The ID of the message to set up reaction roles on')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('emoji')
                .setDescription('The emoji to use for the reaction role')
                .setRequired(true)
            )
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to assign when the reaction is added')
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName('remove')
            .setDescription("remove all reaction roles from a message")
            .addStringOption(option => option
                .setName('messageid')
                .setDescription('The ID of the message to set up reaction roles on')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === "add") {
            try {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles) && interaction.user.id !== interaction.guild.ownerId) {
                    return interaction.reply({
                        embeds: [presets.error("ERROR", "You do not have permissions to manage roles")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply({
                        embeds: [presets.error("ERROR", "I do not have permissions to manage roles")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                const role = interaction.options.getRole('role');

                if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
                    return interaction.reply({
                        embeds: [presets.error("ERROR", "You cannot assign a role higher or equal to your highest role.")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({
                        embeds: [presets.error("ERROR", "I cannot assign a role higher or equal to my highest role.")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                const messageId = interaction.options.getString('messageid');
                const emoji = interaction.options.getString('emoji');

                const duplicateemoji = await queryone(db, "SELECT * FROM reactionroles WHERE guildId = ? AND messageId = ? AND emoji = ?", [interaction.guild.id, messageId, emoji]);
                if (duplicateemoji) {
                    return interaction.reply({
                        embeds: [presets.warning("ERROR", "This emoji is already used for a reaction role on this message.")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                const duplicaterole = await queryone(db, "SELECT * FROM reactionroles WHERE guildId = ? AND messageId = ? AND roleId = ?", [interaction.guild.id, messageId, role.id]);
                if (duplicaterole) {
                    return interaction.reply({
                        embeds: [presets.warning("ERROR", "This role is already used for a reaction role on this message.")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                await execute(db, "INSERT INTO reactionroles (guildId, messageId, emoji, roleId) VALUES (?, ?, ?, ?)", [interaction.guild.id, messageId, emoji, role.id]);
                const message = await interaction.channel.messages.fetch(messageId);

                const ids = await queryall(db, "SELECT messageId FROM reactionroles");

                await message.react(emoji);
                setreactids(ids.map(item => item.messageId));

                return interaction.reply({
                    embeds: [presets.success("SUCCESS", "Reaction role set up successfully!")],
                    flags: MessageFlags.Ephemeral
                });

            } catch (error) {
                console.error(error);
                return interaction.reply({
                    embeds: [presets.error("ERROR", "An unexpected error occurred while processing your request.")],
                    flags: MessageFlags.Ephemeral
                });
            }
        }
        if (sub === "remove") {
            try {
                const messageId = interaction.options.getString('messageid');
                const hasreactions = await queryone(db, "SELECT * FROM reactionroles WHERE guildId = ? AND messageId = ?", [interaction.guild.id, messageId]);

                if (!hasreactions) {
                    return interaction.reply({
                        embeds: [presets.warning("ERROR", "No reaction roles found for this message.")],
                        flags: MessageFlags.Ephemeral
                    });
                }

                await execute(db, "DELETE FROM reactionroles WHERE guildId = ? AND messageId = ?", [interaction.guild.id, messageId]);
                const message = await interaction.channel.messages.fetch(messageId);
                await message.reactions.removeAll();

                return interaction.reply({
                    embeds: [presets.success("SUCCESS", "Reaction roles removed successfully!")],
                    flags: MessageFlags.Ephemeral
                });
            } catch (error) {
                console.error(error);
                return interaction.reply({
                    embeds: [presets.error("ERROR", "An unexpected error occurred while processing your request.")],
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
