

async function dmUser(interaction, member, text) {
    try {
        await member.send(text + `\n-# sent from ${interaction.guild.name}`)
        return true
    } catch (e) {
        return false
    }
}

module.exports = { dmUser }