const {PermissionsBitField} = require("discord.js");
const {chatBan} = require("../chatcommands/ban");
const {chatPurge} = require("../chatcommands/purge");

module.exports = {
    async handleChatCommands(message, client) {
        if (!message.content.startsWith("?")) {
            return
        }
        const command = message.content.split(" ")

        if (command[0].toLowerCase() === "?ban") {
            return await chatBan(message, client)
        }
        if (command[0].toLowerCase() === "?purge") {
            return await chatPurge(message, client)
        }
    }
}