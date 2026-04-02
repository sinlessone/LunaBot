const chalk = require("chalk");
const {MessageFlags} = require("discord.js");
module.exports = {
    async handleerror(interaction, err) {
        console.log(chalk.bgRedBright(err.stack));
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There has been an error while executing your command.',
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: 'There has been an error while executing your command.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}