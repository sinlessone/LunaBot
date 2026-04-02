const {MessageFlags} = require("discord.js");

module.exports = {
    async handlecd(cooldowns, command, interaction) {
        const now = Date.now();
        const userId = interaction.user.id;
        const cooldownAmount = (command.cooldown || 0) * 1000
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }
        const timestamps = cooldowns.get(command.data.name);
        if (timestamps.has(userId)) {
            const expire = timestamps.get(userId);
            const timeleft = expire - now
            if (timeleft > 0) {
                await interaction.reply({
                    content: `⏳ You're on cooldown, Try again in **${Math.ceil(timeleft / 1000)}s**.`,
                    flags: MessageFlags.Ephemeral
                });
                return true
            }
        }
        timestamps.set(userId, now + cooldownAmount)
        setTimeout(() => {
            timestamps.delete(userId)
        }, cooldownAmount)
    }

}