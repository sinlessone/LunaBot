const {queryone, db} = require("../utils/db");


module.exports = async function (message, client) {
    if (message.author.bot) return;
    if (message.member.permissions.has("ADMINISTRATOR")) return
    try {
        await message.member.ban({
            reason: "compromised account"
        })
        await message.delete()
        const { softbanorban } = await queryone(db, "SELECT softbanorban FROM serverconfig WHERE server_id=$1", [message.guild.id])
        if (!softbanorban) {
            await message.member.unban()
        }
    } catch (e) {
        console.error(e)
    }
}