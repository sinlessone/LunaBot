const {queryone, db} = require("../utils/db");
const {PermissionsBitField} = require("discord.js");


module.exports = async function (message, client) {
    if (message.author.bot) return;
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || message.guild.ownerId === message.author.id) return
    try {
        await message.member.ban({
            reason: "compromised account",
            deleteMessageSeconds: 7 * 24 * 60 * 60
        })
        await message.delete()
        const { softbanorban } = await queryone(db, "SELECT softbanorban FROM serverconfig WHERE server_id=$1", [message.guild.id])
        if (!softbanorban) {
            await message.guild.bans.remove(message.author.id)
        }
    } catch (e) {
        console.error(e)
    }
}