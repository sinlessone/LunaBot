const {queryall, db} = require("./db");
module.exports = {
    async getInvitesCount(interaction, userId) {
        const data = await queryall(db, "SELECT * FROM invites WHERE inviterId=? AND serverId=? AND validInvite=1", [userId, interaction.guild.id])
    return data.length
    }
}