const { execute, db, queryone} = require("../utils/db");
const { addVote } = require("../utils/addVote");

const { ButtonBuilder, ActionRowBuilder} = require("discord.js");
module.exports = {
    data: {
        name: "upvote"
    },
    async execute(interaction) {
        const { upvotes, suggestionid } = await queryone(db, "SELECT * FROM suggestions WHERE serverid=? AND suggestionmessageid=?", [interaction.guild.id, interaction.message.id])
        const votes = await queryone(db, "SELECT votetype FROM votes WHERE suggestionid=? AND userid=?", [suggestionid, interaction.user.id])
        const row = interaction.message.components[0];

        if (!votes) {
            await addVote(interaction, suggestionid, upvotes, row, "up")
        }  else {
            await execute(db, "UPDATE suggestions SET upvotes=? WHERE suggestionmessageid=? AND serverid=?", [Number(upvotes) - 1, interaction.message.id, interaction.guild.id])
            if (votes.voteType === "down") {
                await execute(db, "DELETE FROM votes WHERE userid=? AND suggestionid=?", [interaction.user.id, suggestionid])
                await execute(db, "UPDATE suggestions SET downvotes=downvotes-1 WHERE suggestionid=?", [suggestionid])
                return await addVote(interaction, suggestionid, upvotes, row, "up")
            }
            await execute(db, "DELETE FROM votes WHERE userid=? AND suggestionid=?", [interaction.user.id, suggestionid])

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