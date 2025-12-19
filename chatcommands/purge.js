const {PermissionsBitField, resolveColor, MessageFlags, EmbedBuilder} = require("discord.js");
const {purge} = require("../utils/purge");
const {presets} = require("../data/embed");
module.exports = {
    async chatPurge(message) {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                embeds: [presets.warning("", "You do not have permissions to use this command")]
            })
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {

            return message.reply({
                embeds: [presets.warning("", "I do not have permissions to use ban members")]
            })
        }

        const command = message.content.split(" ")

        if (command.length === 1) {
            return message.reply({
                embeds: [presets.warning("", "please provide a number of messages to purge as such:\n?purge (amount)")]
            })
        }

            if (/\D/.test(command[1])) {
                return message.reply({
                    embeds: [presets.warning("", "please only provide a number")]
                })
            }
        if (Number(command[1]) === 0) {
            return message.reply({
                embeds: [presets.warning("", "Please provide a number different than 0")]
            })
        }
        if (Number(command[1]) > 1000) {
            return message.reply({
                embeds: [presets.warning("", "The maximum number of messages to be deleted is 1000")]
            })
        }
            try {
                const deleted = await purge(message, Number(command[1]))
                if (deleted === 0) {
                    return await message.reply({
                        embeds: [presets.warning("No messages deleted", `no messages younger than 2 weeks were find, if this is a bug please contact the bot owner.`)]
                    })
                }
                await message.reply({
                    embeds: [presets.success("SUCCESS", `successfully purged ${deleted} messages`)]
                })
            } catch (e) {
            console.log(e)
                await message.reply({
                    embeds: [presets.error("ERROR", "an unhandled error caught, if persistent please contact the bot owner")]
                })
            }


        }
}