const { Client, Events, GatewayIntentBits, Collection, MessageFlags,
    Partials, time, TimestampStyles
} = require('discord.js');
const fs = require('fs');
const SmeeClient = require('smee-client')
const loadButtonHandler = require('./handlers/buttonhandler');
const path = require('path');
require('dotenv').config({ path: ".env" });
const chalk = require("chalk");
const { ChangeStatus } = require('./utils/ChangeStatus')
const cron = require('node-cron');
const {init} = require("./utils/initializebot");
const {handleaichat} = require("./handlers/handleaichat");
const {loadcommands} = require("./utils/loadcommands");
const {handlecommands} = require("./handlers/handlecommands");
const {getAiIds} = require("./utils/setaiids");
const {deploy} = require("./Deploy");
const {execute, db, queryone, queryall} = require("./utils/db");
const {getSuggestIds} = require("./utils/setsuggestids");
const {handleSuggestions} = require("./handlers/handleSuggestions");
const {inviteTrackerHandler} = require("./handlers/inviteTrackerHandler");
const {handleChatCommands} = require("./handlers/handleChatCommands");
const {getCountIds} = require("./utils/setcountingids");
const {handlecounting} = require("./handlers/handlecounting");
const {getQotd} = require("./utils/getqotd");
const {getreactids} = require("./utils/setreactions");
const {handlereactions} = require("./handlers/handlereactions");
const {handlecountingsabotage} = require("./handlers/handlecountingsabotage");
const {presets} = require("./data/embed");
const handlehoneypot = require("./handlers/handlehoneypot");
const {getHoneypotids} = require("./utils/sethoneypot");
const cooldowns = new Map();
const folderpath = path.join(__dirname, 'Commands');
const CommandsFolder = fs.readdirSync(folderpath);
const fpath = path.join(__dirname, "/config.json")
const invites = new Map();
const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials:[
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ]
});
client.commands = new Collection();
client.buttons = new Collection();
client.blackjackGames = new Map();
loadButtonHandler(client)
let config = JSON.parse(fs.readFileSync(fpath).toString())
loadcommands(client, CommandsFolder, folderpath)


deploy()


client.on("messageCreate", async (message) => {
    if (message.author.bot === true) return
    if (getSuggestIds().includes(message.channel.id)) {
        await handleSuggestions(message)
    }

    if (getAiIds().includes(message.channel.id)) {
        await handleaichat(message, client);
    }

    if (getCountIds().includes(message.channel.id)) {
        await handlecounting(message)
    }
    if (getHoneypotids().includes(message.channel.id)) {
        await handlehoneypot(message, client)
    }
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);
    if (!button)
        return await interaction.reply("no handler for this button");
    try {
        await button.execute(interaction)
    } catch (e) {
        console.log(e + e.stack)
        await interaction.reply({
            content: "an unhandled error occurred",
            flags: MessageFlags.Ephemeral
        })
    }
})

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`);
    if (config.status) {
        await ChangeStatus(client, config.status, config.appearance)
    }
});

client.on(Events.ClientReady, async () => {
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            const firstinvites = await guild.invites.fetch()
            invites.set(
                guildId,
                new Map(firstinvites.map((invite) => [invite.code, invite.uses]))
            )
        } catch (e) {
            // possibly dm the server's owner or notify him of insufficient permissions
        }
    }
})

client.on(Events.MessageCreate, async (message) => {
    await handleChatCommands(message, client)
})

client.on(Events.GuildMemberAdd, async (member) => {
    await inviteTrackerHandler(member, invites)
})

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        await handlecommands(client, interaction, config, cooldowns)
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return
    if (!getreactids().includes(reaction.message.id)) return

    await handlereactions(client, reaction, user, true)

})

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return
    if (!getreactids().includes(reaction.message.id)) return

    await handlereactions(client, reaction, user, false)

})

client.on(Events.MessageUpdate, async (message) => {
    await handlecountingsabotage(message)
})

client.on(Events.MessageDelete, async (message) => {
    await handlecountingsabotage(message)
})






init(client, "./config.json")
    .then(async () => {

        let lastQotd = "this is the first qotd, generate anything"
        cron.schedule("*/15 * * * * *", async () => {
            try {
                const giveaways = await queryall(db, "SELECT * FROM giveaways WHERE isDone=0 AND endsAt < ?", [Date.now()]);

                for (const i of giveaways) {
                    try {
                        const channel = client.channels.cache.get(i["channelid"]) || await client.channels.fetch(i["channelid"]);
                        const message = await channel.messages.fetch(i["messageid"]);

                        const winners = await queryall(db, "SELECT * FROM entries WHERE messageId=? AND guildId=? ORDER BY random() LIMIT ?", [message.id, channel.guild.id, i["winnercount"]]);

                        if (!winners || winners.length === 0) {
                            await message.edit({
                                embeds: [presets.warning("FINISHED", `giveaway for: ${i["prize"]}\nEnded at: ${time(Math.floor(i["endsAt"]/1000), TimestampStyles.RelativeTime)}\nNo one joined this giveaway`)],
                                components: []
                            });
                            await message.reply({
                                embeds: [presets.warning("GIVEAWAY ENDED", `No winners as no one joined the giveaway`)]
                            });
                        } else {
                            const winnerMentions = winners.map(w => `<@${w.userid}>`).join("\n");
                            await message.edit({
                                embeds: [presets.info("FINISHED", `giveaway for: ${i["prize"]}\nEnded at: ${time(Math.floor(i["endsAt"]/1000), TimestampStyles.RelativeTime)}\nWinners: ${winnerMentions}`)],
                                components: []
                            });
                            await message.reply({
                                embeds: [presets.success("GIVEAWAY ENDED", `the winners are:\n ${winnerMentions}`)]
                            });
                        }

                        await execute(db, "UPDATE giveaways SET isDone=1 WHERE messageId=? AND serverId=?", [message.id, channel.guild.id]);

                    } catch (e) {
                        console.error(`Error processing giveaway ${i["messageId"]}:`, e.message);

                        const unrecoverableCodes = [50013, 50001, 10008, 10003];

                        if (unrecoverableCodes.includes(e.code) || e.message.includes("fetch")) {
                            console.log(`Force-completing dead giveaway ${i["messageid"]} in DB due to unrecoverable Discord error.`);
                            await execute(db, "UPDATE giveaways SET isDone=1 WHERE messageId=? AND serverId=?", [i["messageid"], i["serverid"]]);
                        }

                    }
                }
            } catch (globalErr) {
                console.error("Global Cron Error:", globalErr);
            }
        });
        cron.schedule("0 0 0 * * *", async () => {

            const data = await queryall(db, "SELECT qotd_channel FROM serverconfig WHERE qotd_enabled=?", [1])

            const qotdchannels = data.map(item => item["qotd_channel"])
            const qotd = await getQotd(lastQotd)
            lastQotd = qotd
            for (const item of qotdchannels) {
                try {
                    const channel = await client.channels.fetch(item)
                    if (qotd.text) {
                        await channel.send(qotd.text)
                    } else {
                        const {question: question} = await queryone(db, "SELECT question FROM qotd WHERE used=0 ORDER BY random()")
                        await channel.send(question)
                    }
                } catch (e) {
                    console.log(e)
                }
            }

        })
    }).catch(error => {
    console.error(chalk.red(`[ERROR] A FATAL ERROR OCCURRED, ${error.stack}`))
})
