const chalk = require("chalk");
const {getaichannels} = require("../utils/db");
const {handlecd} = require("./handlecd");
const {MessageFlags, PermissionsBitField} = require("discord.js");
const {handleerror} = require("./handleerror");
const {setAiIds} = require("../utils/setaiids");
const {presets} = require("../data/embed");
module.exports = {
    async handlecommands(client, interaction, config, cooldowns){
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.log(chalk.bgRedBright(`No interaction ${interaction.commandName} found`));
            return;
        }

        if (!interaction.guild.id || command.allowInDms) {
            return interaction.reply({
                embeds: [presets.error("ERROR", "This command can only be used in a server.")],
                flags: MessageFlags.Ephemeral
            })
        }
        if (interaction.commandName === "setaichannel") {
            const channels = await getaichannels();
            setAiIds(channels.map(item => item.ai_channel_id));
        }
        if (interaction.user.id !== config?.ownerID && await handlecd(cooldowns, command, interaction)) return;

        if (command.ownerOnly && interaction.user.id !== config?.ownerID) {
            return interaction.reply({
                embeds: [presets.error("ERROR", "Only the bot's owner can use this command")],
                flags: MessageFlags.Ephemeral
            })
        }
        if (command.modOnly) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({
                embeds: [presets.error("ERROR", "This command is only available to members with kick permissions")],
                flags: MessageFlags.Ephemeral
            })
        }
        if (command.adminOnly) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({
                embeds: [presets.error("ERROR", "This command is only available to members with admin perms")],
                flags: MessageFlags.Ephemeral
            })
        }
        try {
            await command.execute(interaction);
        } catch (err) {
            await handleerror(interaction, err)
        }
    }
}