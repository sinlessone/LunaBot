const {queryone, db} = require("../utils/db");

module.exports = {
    async handlereactions(client, messageReaction, user, added) {
        try {
            const message = messageReaction.message.id;
            const emoji = messageReaction.emoji.name;
            const member = client.guilds.cache.get(messageReaction.message.guild.id).members.cache.get(user.id);

            if (!member) return;

            const reactions = await queryone(db, "SELECT * FROM reactionroles WHERE messageId=? AND emoji=?", [message, emoji]);
            if (!reactions) {
                if (added) await messageReaction.remove();
                return;
            }

            const role = messageReaction.message.guild.roles.cache.get(reactions["roleId"]);
            if (!role) return;

            // Check role hierarchy
            if (role.position >= member.guild.members.me.roles.highest.position) {
                // perhaps dm the server owner or log this incident, as it indicates a misconfiguration of the reaction role
                return;
            }

            if (added) {
                await member.roles.add(role).catch(err => console.error("Failed to add role:", err));
            } else {
                await member.roles.remove(role).catch(err => console.error("Failed to remove role:", err));
            }
        } catch (error) {
            console.error("An error occurred in handlereactions:", error);
        }
    }
};
