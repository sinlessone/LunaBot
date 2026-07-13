const {SlashCommandBuilder, EmbedBuilder, resolveColor, MessageFlags, PermissionsBitField} = require('discord.js')
const { IsBanned } = require('../../utils/IsBanned.js')
const config = require('../../config.json')
const {presets} = require("../../data/embed");
const {execute, db} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Automatically appends a role to users joining the server!')
        .addRoleOption(option => option
            .setName('role')
            .setDescription("The role to assigns to new members")
            .setRequired(true)
        ),
    adminOnly: true,
    cooldown: 5,

    async execute(interaction) {

        const role = interaction.options.getRole('role');
        try {
            if (interaction.member.roles.highest.position > role.rawPosition || interaction.userId !== interaction.guild.ownerId) {
                console.log(interaction.guild.members.me.roles.highest.position, role.rawPosition)
                if (!(interaction.guild.members.me.roles.highest.position > role.rawPosition)) return interaction.reply({
                    embeds: [presets.error("Insufficient permissions", "I cannot manage a role higher or equal to my highest role.")],
                })
                await execute(db, "UPDATE serverconfig SET joinroleid=$1 WHERE server_id=$2", [role.id, interaction.guild.id])
                await interaction.reply({
                    embeds: [presets.success("Success", `Successfully setup the auto role on join\nAll new members will be assigned the role <@&${role.id}>.`)]
                })
            } else {
                if (!interaction.client.member.roles.highest.position > role.rawPosition) return interaction.reply({
                    embeds: [presets.error("Insufficient permissions", "I cannot manage a role higher or equal to my highest role.")],
                })
            }
        } catch (e) {
            console.log( e)
        }
    }
}