const {string} = require("mathjs");
const {EmbedBuilder} = require("discord.js");
const {db, queryone} = require("../utils/db");
module.exports = {
    async handleCommit(client, req) {
        const body = req.body;
        if (req.headers["x-github-event"] === "push") {

            try {
                let commitAuthors = new Set
                for (const commit of body.commits) {
                    commitAuthors.add(commit.author.name)
                }
                const {commitchannelid: channelId} = await queryone(db, "SELECT * FROM ownerconfig")
                const channel = await client.channels.fetch(channelId)
                for (const commit of body.commits) {
                    const commitURL = commit.url
                    const filesModified = commit.modified.length
                    const filesAdded = commit.added.length
                    const filesRemoved = commit.removed.length
                    const commitBranch = body.ref.replace("refs/heads/", '')
                    const commitMessage = commit.message
                    const embed = new EmbedBuilder()
                        .setTitle("💎 New commit to bot!")
                        .setURL(commitURL)
                        .setColor(1077683)
                        .addFields([
                            {name: "📋 **Commit message:**", value: `${commitMessage}`, inline: false},
                            {name: "🔃 Files Changed", value: `\`+${filesAdded}\` Added\n\`-${filesRemoved}\` Deleted\n\`±${filesModified}\` Modified`, inline: true},
                            {name: "", value: "", inline: true},
                            {name: "ℹ️ Details", value: `Branch: ${commitBranch}\nDate: <t:${Math.floor(new Date(commit.timestamp).getTime() / 1000)}:R>`, inline: true},
                            {name: "📁 File types (todo)            ", value: "hey", inline: true},
                            {name: "👤 Author(s)", value: Array.from(commitAuthors).join(", "), inline: true},

                        ])
                    channel.send({
                        embeds: [embed],
                    })

                }
                return
            } catch (e) {
                console.error("Error sending github commit message\n", e)
            }
        }

        if (req.headers["x-github-event"] === "star") {
            try {
                if (body.action === "created") {
                    const newStarCount = body.repository["stargazers_count"]
                    const {commitchannelid: channelId} = await queryone(db, "SELECT * FROM ownerconfig")
                    const channel = await client.channels.fetch(channelId)
                    const imageURL = body.sender["avatar_url"]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: body.sender.login, iconURL: imageURL, url: body.sender.url})
                        .setTitle(`🌟 New star added (${newStarCount})! ${body.repository["full_name"]}`)
                        .setURL(body.repository.html_url)
                        .setColor(1077683)
                    channel.send({
                        embeds: [embed]
                    })
                }
            } catch (e) {
                console.error("Error sending github commit message\n", e)
            }
        }
    }
}