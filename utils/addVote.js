const {execute, db, queryone} = require("./db");
const {ButtonBuilder, ActionRowBuilder} = require("discord.js");
async function addVote(interaction, suggestionId, votes, row, type) {
    if (type === "up") {
        console.log(suggestionId);

        await execute(db, "UPDATE suggestions SET upvotes=? WHERE suggestionId=?", [Number(votes) + 1, suggestionId])
        await execute(
            db,
            `INSERT INTO votes (suggestionid, userid, votetype) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (suggestionId, userId) 
     DO UPDATE SET votetype = EXCLUDED.votetype`,
            [suggestionId, interaction.user.id, "up"]
        );
        const { upvotes: NewUpVotes, downvotes: newDownVotes } = await queryone(db, "SELECT * FROM suggestions WHERE suggestionId=?", [suggestionId])


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
        await interaction.update({components: [newRow]});
    }
    if (type === "down") {
        await execute(db, "UPDATE suggestions SET downvotes=? WHERE suggestionId=?", [Number(votes) + 1, suggestionId])
        console.log(suggestionId, interaction.user.id, "down")
        await execute(db, `INSERT INTO votes (suggestionid, userid, votetype)
                           VALUES ($1, $2, $3)
                           ON CONFLICT (suggestionId, userId)
                               DO UPDATE SET votetype = EXCLUDED.votetype`, [suggestionId, interaction.user.id, "down"])

        const { upvotes: NewUpVotes, downvotes: newDownVotes } = await queryone(db, "SELECT * FROM suggestions WHERE suggestionId=?", [suggestionId])


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
        await interaction.update({components: [newRow]});
    }
}

module.exports = {addVote}