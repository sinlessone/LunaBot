const {queryone, db, execute} = require("../utils/db");
module.exports = {
    async inviteTrackerHandler(member, invites) {
        try {

            const cachedInvites = invites.get(member.guild.id)
            const newInvites = await member.guild.invites.fetch()

            const inviteUsed = newInvites.find(
                (invite) => cachedInvites.get(invite.code) < invite.uses
            )
            if (inviteUsed) {
                console.log(`${member.user.username} was invited using code ${inviteUsed.code} by ${inviteUsed.inviter.tag}`)
                const InviteExists = await queryone(db, "SELECT * FROM invites WHERE invitedId=? AND serverId=?", [member.user.id, member.guild.id])
                if (!InviteExists) {
                    await execute(db, "INSERT INTO invites(invitedId, inviterId, inviteCode, serverId) VALUES(?, ?, ?, ?)", [member.user.id, inviteUsed.inviter.id, inviteUsed.code, member.guild.id])
                } else {
                    await execute(db, "UPDATE invites SET inviterId=?, inviteCode=? WHERE invitedId =? AND serverId=?", [inviteUsed.inviter.id, inviteUsed.code, member.user.id, member.guild.id])
                }
            }
            invites.set(
                member.guild.id,
                new Map(newInvites.map((invite) => [invite.code, invite.uses]))
            )
        } catch (e) {
            console.log("an unhandled error caught")
        }
    }
}