async function reply(interaction, content, ephemeral = false) {
    if (content.embeds) {
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    embeds: [...content.embeds],
                    ephemeral
                });
            } else {
                await interaction.reply({
                    embeds: [...content.embeds],
                    ephemeral
                });
            }
        } catch (e) {
            console.log("Error in reply function:", e)
        }
        return
    }
    if (typeof content === "string") {
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content,
                    ephemeral
                });
            } else {
                await interaction.reply({
                    content,
                    ephemeral
                });
            }
        } catch (e) {
            console.error("Error in reply function:", e);
        }
        return
    }
    console.warn("Reply function received content in an unexpected format:", content);
}


module.exports = { reply };