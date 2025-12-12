    const { Client, Events, GatewayIntentBits, Collection, ButtonStyle, MessageFlags, ActionRowBuilder, ButtonBuilder} = require('discord.js');
    const fs = require('fs');
    const loadButtonHandler = require('./handlers/buttonhandler');
    const path = require('path');
    require('dotenv').config({ path: ".env" });
    const chalk = require("chalk");
    const { ChangeStatus } = require('./utils/ChangeStatus')
    const cron = require('node-cron');
    const { v4: uuidv4 } = require('uuid');
    const {init} = require("./utils/initializebot");
    const {handleaichat} = require("./utils/handleaichat");
    const {loadcommands} = require("./utils/loadcommands");
    const {handlecommands} = require("./utils/handlecommands");
    const {getAiIds} = require("./utils/setaiids");
    const {deploy} = require("./Deploy");
    const {execute, db, queryone} = require("./utils/db");
    const {getSuggestIds} = require("./utils/setsuggestids");
    const {handleSuggestions} = require("./utils/handleSuggestions");
    const {inviteTrackerHandler} = require("./handlers/inviteTrackerHandler");
    const {handleChatCommands} = require("./handlers/handleChatCommands");
    const {getCountIds} = require("./utils/setcountingids");
    const {handlecounting} = require("./utils/handlecounting");
    const cooldowns = new Map();
    const folderpath = path.join(__dirname, 'Commands');
    const CommandsFolder = fs.readdirSync(folderpath);
    const fpath = path.join(__dirname, "/config.json")
    const invites = new Map();
    const client = new Client({ intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });
    client.commands = new Collection();
    client.buttons = new Collection();
    loadButtonHandler(client)
    let config = JSON.parse(fs.readFileSync(fpath).toString())
    loadcommands(client, CommandsFolder, folderpath)

    deploy()


    client.on("messageCreate", async (message) => {
        if (message.author.bot === true) return
        if (getSuggestIds().includes(message.channel.id)) {
            return await handleSuggestions(message)
        }

        if (getAiIds().includes(message.channel.id)) {
            return await handleaichat(message, client);
        }

        if (getCountIds().includes(message.channel.id)) {
            console.log("this was sent in a counting channel")
            return await handlecounting(message)
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
            const firstinvites = await guild.invites.fetch()
            invites.set(
                guildId,
                new Map(firstinvites.map((invite) => [invite.code, invite.uses]))
            )
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

    init(client, "./config.json")
    .then(async () => {
        console.log("initialized successfully")
        cron.schedule("0 9 * * *", async () => {

        })
    }).catch(error => {
        console.error(chalk.red(`[ERROR] A FATAL ERROR OCCURRED, ${error.stack}`))
})
