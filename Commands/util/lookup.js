const { SlashCommandBuilder, EmbedBuilder, resolveColor, MessageFlags} = require('discord.js');
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Get info about a user ')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user to lookup')
        ),
    async execute(interaction){
        const user = interaction.options.getUser('user') ?? interaction.user
        const member = interaction.guild.members.cache.get(user.id)
        const UserAvatar = user.avatarURL({ size: 128 }) ?? user.defaultAvatarURL
        const embed = new EmbedBuilder()
            .setColor(resolveColor("Blue"))
            .setFooter({
                text: config.footer,
                iconURL: config.footerUrl = interaction.options.getMember('user')
            })
            .setTimestamp(new Date())
            .setThumbnail(UserAvatar)
            .setTitle(user.username)
            .addFields([
                { name: 'Global Nickname', value: user.globalName || `${user.username}#${user.discriminator}`},
                { name: 'ID', value: user.id},
                { name: 'Created At', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`},
                { name: 'Is Human?', value: user.bot ? "❌" : "✅"}
            ])
 if (member) {
     const roles = member.roles.cache
         .filter((roles) => roles.id !== member.guild.id)
     .map((role) => role.toString())
         .join(', ')
         .replace(/,/g, '')
     const JoinTime =`<t:${Math.floor(member.joinedTimestamp / 1000)}>`
    embed.addFields([
        { name: 'Joined At', value: JoinTime},
        { name: 'Roles', value: roles}
    ])
 }
        await interaction.reply({ embeds: [embed] })
    }
}