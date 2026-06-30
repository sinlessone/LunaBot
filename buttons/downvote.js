const { execute , db, queryone} = require("../utils/db");
const { addVote } = require("../utils/addVote");

const {ButtonBuilder, ActionRowBuilder} = require("discord.js");
module.exports = {
    data: {
        name: "downvote"
    },
    async execute(interaction) {
        const { downvotes, suggestionid } = await queryone(db, "SELECT * FROM suggestions WHERE serverId=? AND suggestionMessageId=?", [interaction.guild.id, interaction.message.id])
        const votes = await queryone(db, "SELECT voteType FROM votes WHERE suggestionId=? AND userId=?", [suggestionid, interaction.user.id])
        const row = interaction.message.components[0];

        if (!votes) {
            await addVote(interaction, suggestionid, downvotes, row, "down")
        }  else {
            await execute(db, "UPDATE suggestions SET downvotes=? WHERE suggestionMessageId=? AND serverId=?", [Number(downvotes) - 1, interaction.message.id, interaction.guild.id])
            if (votes.votetype === "up") {
                await execute(db, "DELETE FROM votes WHERE userId=? AND suggestionid=?", [interaction.user.id, suggestionid])
                await execute(db, "UPDATE suggestions SET upvotes=upvotes-1 WHERE suggestionid=?", [suggestionid])
                return await addVote(interaction, suggestionid, downvotes, row, "down")
            }
            await execute(db, "DELETE FROM votes WHERE userId=? AND suggestionid=?", [interaction.user.id, suggestionid])

            const { upvotes: NewUpVotes, downvotes: newDownVotes } = await queryone(db, "SELECT * FROM suggestions WHERE suggestionid=?", [suggestionid])


            const newComponents = row.components.map((button, i) => {
                if (i === 0) {
                    return ButtonBuilder.from(button).setLabel(String(NewUpVotes))
                }
                if (i === 1) {
                    return ButtonBuilder.from(button).setLabel(String(NewUpVotes-newDownVotes))
                }
                if (i === 2) {
                    return ButtonBuilder.from(button).setLabel(String(newDownVotes));
                }
                return ButtonBuilder.from(button);
            });
            const newRow = new ActionRowBuilder().addComponents(newComponents);
            await interaction.update({ components: [newRow] });

        }

    }
}